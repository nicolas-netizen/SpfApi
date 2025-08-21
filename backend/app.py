from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import os
import json
from pathlib import Path
from typing import List, Dict, Any
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CSV Dashboard API",
    description="API para leer y servir datos CSV para dashboard",
    version="1.0.0"
)

# Configurar CORS para desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración
DATA_DIR = Path("data")
ALLOWED_EXTENSIONS = {".csv"}

@app.on_event("startup")
async def startup_event():
    """Crear directorio de datos si no existe"""
    DATA_DIR.mkdir(exist_ok=True)
    logger.info(f"Directorio de datos: {DATA_DIR.absolute()}")

def get_csv_files() -> List[str]:
    """Obtener lista de archivos CSV disponibles"""
    if not DATA_DIR.exists():
        return []
    
    csv_files = []
    for file in DATA_DIR.glob("*.csv"):
        if file.suffix.lower() in ALLOWED_EXTENSIONS:
            csv_files.append(file.name)
    
    return csv_files

def read_csv_data(filename: str) -> Dict[str, Any]:
    """Leer datos de un archivo CSV específico"""
    file_path = DATA_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"Archivo {filename} no encontrado")
    
    try:
        # Intentar diferentes encodings
        encodings = ['utf-8', 'latin-1', 'cp1252']
        df = None
        
        for encoding in encodings:
            try:
                df = pd.read_csv(file_path, encoding=encoding)
                break
            except UnicodeDecodeError:
                continue
        
        if df is None:
            raise HTTPException(status_code=400, detail="No se pudo leer el archivo CSV")
        
        # Limpiar datos
        df = df.dropna()
        
        # Convertir a formato JSON-friendly
        data = df.to_dict(orient="records")
        
        # Información del dataset - Convertir tipos numpy a Python nativos
        info = {
            "filename": filename,
            "rows": int(len(df)),
            "columns": list(df.columns),
            "data_types": {col: str(dtype) for col, dtype in df.dtypes.items()},
            "sample_data": data[:5] if len(data) > 5 else data
        }
        
        return {
            "info": info,
            "data": data,
            "total_rows": len(data)
        }
        
    except Exception as e:
        logger.error(f"Error leyendo {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error procesando CSV: {str(e)}")

@app.get("/")
async def root():
    """Endpoint raíz con información de la API"""
    return {
        "message": "CSV Dashboard API",
        "version": "1.0.0",
        "endpoints": {
            "/files": "Lista de archivos CSV disponibles",
            "/data/{filename}": "Datos de un archivo CSV específico",
            "/upload": "Subir nuevo archivo CSV"
        }
    }

@app.get("/files")
async def list_files():
    """Listar archivos CSV disponibles"""
    files = get_csv_files()
    return {
        "files": files,
        "count": len(files),
        "data_directory": str(DATA_DIR.absolute())
    }

@app.get("/data/{filename}")
async def get_data(filename: str):
    """Obtener datos de un archivo CSV específico"""
    return read_csv_data(filename)

@app.get("/data/{filename}/info")
async def get_file_info(filename: str):
    """Obtener solo información del archivo CSV"""
    data = read_csv_data(filename)
    return data["info"]

@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    """Subir un nuevo archivo CSV"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Nombre de archivo requerido")
    
    if not file.filename.lower().endswith('.csv'):
        raise HTTPException(status_code=400, detail="Solo se permiten archivos CSV")
    
    try:
        # Guardar archivo
        file_path = DATA_DIR / file.filename
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Verificar que se puede leer
        df = pd.read_csv(file_path)
        
        return {
            "message": f"Archivo {file.filename} subido exitosamente",
            "filename": file.filename,
            "rows": int(len(df)),
            "columns": list(df.columns)
        }
        
    except Exception as e:
        # Eliminar archivo si hay error
        if file_path.exists():
            file_path.unlink()
        
        logger.error(f"Error subiendo {file.filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error subiendo archivo: {str(e)}")

@app.delete("/files/{filename}")
async def delete_file(filename: str):
    """Eliminar un archivo CSV"""
    file_path = DATA_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"Archivo {filename} no encontrado")
    
    try:
        file_path.unlink()
        return {"message": f"Archivo {filename} eliminado exitosamente"}
    except Exception as e:
        logger.error(f"Error eliminando {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error eliminando archivo: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
