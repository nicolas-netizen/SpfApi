import os
import pandas as pd
from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Configuración para subida de archivos
UPLOAD_FOLDER = 'data'
ALLOWED_EXTENSIONS = {'csv'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Asegurar que el directorio de datos existe
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_csv_files():
    """Obtener lista de archivos CSV disponibles"""
    files = []
    if os.path.exists(UPLOAD_FOLDER):
        for filename in os.listdir(UPLOAD_FOLDER):
            if filename.endswith('.csv'):
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                file_stat = os.stat(file_path)
                
                # Determinar si es el archivo principal (por ahora KPISPF.csv)
                is_main = filename == 'KPISPF.csv'
                
                files.append({
                    'name': filename,
                    'size': file_stat.st_size,
                    'upload_date': pd.Timestamp.fromtimestamp(file_stat.st_mtime).strftime('%Y-%m-%d %H:%M'),
                    'is_main': is_main
    
                })
    
    return files

@app.route('/')
def index():
    return "SPARKFOUND API - Backend funcionando"

@app.route('/data/<filename>')
def get_data(filename):
    try:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if not os.path.exists(file_path):
            return jsonify({'success': False, 'error': 'Archivo no encontrado'}), 404
        
        df = pd.read_csv(file_path)
        data = df.to_dict('records')
        
        return jsonify({
            'success': True,
            'data': data,
            'total_rows': len(data),
            'columns': list(df.columns)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/update-kpi', methods=['POST'])
def update_kpi():
    try:
        data = request.get_json()
        kpi_name = data.get('name')
        new_value = data.get('value')
        
        if not kpi_name or new_value is None:
            return jsonify({'success': False, 'error': 'Nombre y valor del KPI son requeridos'}), 400
        
        # Leer el archivo CSV principal
        csv_path = os.path.join(app.config['UPLOAD_FOLDER'], 'KPISPF.csv')
        if not os.path.exists(csv_path):
            return jsonify({'success': False, 'error': 'Archivo CSV principal no encontrado'}), 404
        
        df = pd.read_csv(csv_path)
        
        # Verificar que la columna existe
        if kpi_name not in df.columns:
            return jsonify({'success': False, 'error': f'KPI "{kpi_name}" no encontrado'}), 404
        
        # Actualizar el valor
        df.loc[0, kpi_name] = new_value
        
        # Guardar el archivo
        df.to_csv(csv_path, index=False)
        
        # Retornar los datos actualizados
        updated_data = df.to_dict('records')[0]
        return jsonify({
            'success': True,
            'message': f'KPI "{kpi_name}" actualizado exitosamente',
            'data': updated_data
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/create-kpi', methods=['POST'])
def create_kpi():
    try:
        data = request.get_json()
        kpi_name = data.get('name')
        kpi_value = data.get('value')
        
        if not kpi_name or kpi_value is None:
            return jsonify({'success': False, 'error': 'Nombre y valor del KPI son requeridos'}), 400
        
        # Leer el archivo CSV principal
        csv_path = os.path.join(app.config['UPLOAD_FOLDER'], 'KPISPF.csv')
        if not os.path.exists(csv_path):
            return jsonify({'success': False, 'error': 'Archivo CSV principal no encontrado'}), 404
        
        df = pd.read_csv(csv_path)
        
        # Verificar que la columna no existe
        if kpi_name in df.columns:
            return jsonify({'success': False, 'error': f'KPI "{kpi_name}" ya existe'}), 409
        
        # Agregar nueva columna
        df[kpi_name] = kpi_value
        
        # Guardar el archivo
        df.to_csv(csv_path, index=False)
        
        # Retornar los datos actualizados
        updated_data = df.to_dict('records')[0]
        return jsonify({
            'success': True,
            'message': f'KPI "{kpi_name}" creado exitosamente',
            'data': updated_data
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/delete-kpi', methods=['DELETE'])
def delete_kpi():
    try:
        data = request.get_json()
        kpi_name = data.get('name')
        
        if not kpi_name:
            return jsonify({'success': False, 'error': 'Nombre del KPI es requerido'}), 400
        
        # Leer el archivo CSV principal
        csv_path = os.path.join(app.config['UPLOAD_FOLDER'], 'KPISPF.csv')
        if not os.path.exists(csv_path):
            return jsonify({'success': False, 'error': 'Archivo CSV principal no encontrado'}), 404
        
        df = pd.read_csv(csv_path)
        
        # Verificar que la columna existe
        if kpi_name not in df.columns:
            return jsonify({'success': False, 'error': f'KPI "{kpi_name}" no encontrado'}), 404
        
        # Eliminar la columna
        df = df.drop(columns=[kpi_name])
        
        # Guardar el archivo
        df.to_csv(csv_path, index=False)
        
        return jsonify({
            'success': True,
            'message': f'KPI "{kpi_name}" eliminado exitosamente'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/upload-csv', methods=['POST'])
def upload_csv():
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No se seleccionó ningún archivo'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No se seleccionó ningún archivo'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            # Guardar el archivo
            file.save(file_path)
            
            # Leer el CSV para detectar las columnas
            try:
                df = pd.read_csv(file_path)
                columns = list(df.columns)
                total_rows = len(df)
                
                return jsonify({
                    'success': True,
                    'message': f'Archivo "{filename}" subido exitosamente',
                    'filename': filename,
                    'columns': columns,
                    'total_rows': total_rows,
                    'preview_data': df.head(5).to_dict('records')  # Primeras 5 filas como preview
                })
            except Exception as e:
                return jsonify({
                    'success': False, 
                    'error': f'Error leyendo el CSV: {str(e)}'
                }), 400
        else:
            return jsonify({'success': False, 'error': 'Tipo de archivo no permitido. Solo se permiten archivos CSV'}), 400
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/list-csv', methods=['GET'])
def list_csv():
    try:
        files = get_csv_files()
        return jsonify({
            'success': True,
            'files': files
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/set-main-csv', methods=['POST'])
def set_main_csv():
    try:
        data = request.get_json()
        filename = data.get('filename')
        
        if not filename:
            return jsonify({'success': False, 'error': 'Nombre del archivo es requerido'}), 400
        
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if not os.path.exists(file_path):
            return jsonify({'success': False, 'error': 'Archivo no encontrado'}), 404
        
        # Por ahora, simplemente renombramos el archivo actual como principal
        # En una implementación más robusta, podrías usar un archivo de configuración
        current_main = os.path.join(app.config['UPLOAD_FOLDER'], 'KPISPF.csv')
        
        # Si existe un archivo principal actual, hacer backup
        if os.path.exists(current_main) and current_main != file_path:
            backup_name = f"KPISPF_backup_{pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')}.csv"
            backup_path = os.path.join(app.config['UPLOAD_FOLDER'], backup_name)
            os.rename(current_main, backup_path)
        
        # Renombrar el archivo seleccionado como principal
        new_main_path = os.path.join(app.config['UPLOAD_FOLDER'], 'KPISPF.csv')
        os.rename(file_path, new_main_path)
        
        return jsonify({
            'success': True,
            'message': f'"{filename}" establecido como archivo CSV principal'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/get-csv-data/<filename>', methods=['GET'])
def get_csv_data(filename):
    try:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if not os.path.exists(file_path):
            return jsonify({'success': False, 'error': 'Archivo no encontrado'}), 404
        
        # Leer el CSV completo
        df = pd.read_csv(file_path)
        
        return jsonify({
            'success': True,
            'filename': filename,
            'columns': list(df.columns),
            'total_rows': len(df),
            'data': df.to_dict('records')
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/delete-csv', methods=['DELETE'])
def delete_csv():
    try:
        data = request.get_json()
        filename = data.get('filename')
        
        if not filename:
            return jsonify({'success': False, 'error': 'Nombre del archivo es requerido'}), 400
        
        # No permitir eliminar el archivo principal
        if filename == 'KPISPF.csv':
            return jsonify({'success': False, 'error': 'No se puede eliminar el archivo CSV principal'}), 400
        
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if not os.path.exists(file_path):
            return jsonify({'success': False, 'error': 'Archivo no encontrado'}), 404
        
        # Eliminar el archivo
        os.remove(file_path)
        
        return jsonify({
            'success': True,
            'message': f'Archivo "{filename}" eliminado exitosamente'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/update-csv-row', methods=['POST'])
def update_csv_row():
    try:
        data = request.get_json()
        filename = data.get('filename')
        row_index = data.get('row_index')
        row_data = data.get('data')
        
        if not all([filename, row_index is not None, row_data]):
            return jsonify({'success': False, 'error': 'Todos los campos son requeridos'}), 400
        
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if not os.path.exists(file_path):
            return jsonify({'success': False, 'error': 'Archivo no encontrado'}), 404
        
        # Leer el CSV
        df = pd.read_csv(file_path)
        
        # Verificar que el índice de fila existe
        if row_index >= len(df):
            return jsonify({'success': False, 'error': 'Índice de fila fuera de rango'}), 400
        
        # Actualizar la fila
        for column, value in row_data.items():
            if column in df.columns:
                # Convertir el valor si es numérico
                try:
                    if isinstance(df[column].iloc[0], (int, float)):
                        value = float(value) if '.' in str(value) else int(value)
                except:
                    pass
                df.loc[row_index, column] = value
        
        # Guardar el archivo
        df.to_csv(file_path, index=False)
        
        return jsonify({
            'success': True,
            'message': f'Fila {row_index} actualizada exitosamente',
            'data': df.to_dict('records')
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/delete-csv-row', methods=['POST'])
def delete_csv_row():
    try:
        data = request.get_json()
        filename = data.get('filename')
        row_index = data.get('row_index')
        
        if not all([filename, row_index is not None]):
            return jsonify({'success': False, 'error': 'Nombre del archivo e índice de fila son requeridos'}), 400
        
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if not os.path.exists(file_path):
            return jsonify({'success': False, 'error': 'Archivo no encontrado'}), 404
        
        # Leer el CSV
        df = pd.read_csv(file_path)
        
        # Verificar que el índice de fila existe
        if row_index >= len(df):
            return jsonify({'success': False, 'error': 'Índice de fila fuera de rango'}), 400
        
        # Eliminar la fila
        df = df.drop(index=row_index).reset_index(drop=True)
        
        # Guardar el archivo
        df.to_csv(file_path, index=False)
        
        return jsonify({
            'success': True,
            'message': f'Fila {row_index} eliminada exitosamente',
            'data': df.to_dict('records')
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/add-csv-row', methods=['POST'])
def add_csv_row():
    try:
        data = request.get_json()
        filename = data.get('filename')
        row_data = data.get('data')
        
        if not all([filename, row_data]):
            return jsonify({'success': False, 'error': 'Nombre del archivo y datos de la fila son requeridos'}), 400
        
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if not os.path.exists(file_path):
            return jsonify({'success': False, 'error': 'Archivo no encontrado'}), 404
        
        # Leer el CSV
        df = pd.read_csv(file_path)
        
        # Crear nueva fila
        new_row = {}
        for column in df.columns:
            if column in row_data:
                value = row_data[column]
                # Convertir el valor si es numérico
                try:
                    if isinstance(df[column].iloc[0], (int, float)):
                        value = float(value) if '.' in str(value) else int(value)
                except:
                    pass
                new_row[column] = value
            else:
                new_row[column] = ''  # Valor por defecto
        
        # Agregar la nueva fila
        df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
        
        # Guardar el archivo
        df.to_csv(file_path, index=False)
        
        return jsonify({
            'success': True,
            'message': 'Nueva fila agregada exitosamente',
            'data': df.to_dict('records')
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
