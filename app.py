"""
PhoneCorp - Backend DNI con Selenium
Scraping de consultadni.com para validación real de DNI peruano.

Instalación:
    pip install flask selenium webdriver-manager flask-cors

Ejecución:
    python app.py

El servidor corre en http://localhost:5000
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import re
import time

app = Flask(__name__)
CORS(app)  # Permite peticiones desde index.html (localhost o file://)


def get_chrome_driver():
    """Crea y retorna un driver de Chrome en modo headless."""
    options = Options()
    options.add_argument("--headless")          # Sin interfaz gráfica
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1280,800")
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
    service = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=options)


def scrape_dni(dni: str) -> dict:
    """
    Abre consultadni.com, ingresa el DNI, hace clic en Consultar
    y extrae los resultados.

    Returns:
        dict con claves: nombres, apellido_paterno, apellido_materno,
                         nombre_completo, codigo_verificacion, sexo,
                         fecha_nacimiento
    Raises:
        ValueError si el DNI no tiene 8 dígitos.
        RuntimeError si el sitio no responde o no hay resultados.
    """
    if not re.fullmatch(r"\d{8}", dni):
        raise ValueError("El DNI debe tener exactamente 8 dígitos numéricos.")

    driver = get_chrome_driver()
    resultado = {}

    try:
        driver.get("https://www.consultadni.com/")

        wait = WebDriverWait(driver, 15)

        # ── 1. Localizar el input de DNI ──
        # El input tiene id="dni" o name="dni" (inspeccionado del sitio)
        input_dni = wait.until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='text'], input[type='number'], #dni, [name='dni']"))
        )
        input_dni.clear()
        input_dni.send_keys(dni)

        # ── 2. Hacer clic en el botón Consultar ──
        btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit'], button[onclick], #btn-consultar, .btn-consultar")
        btn.click()

        # ── 3. Esperar a que aparezca el resultado ──
        # Esperamos que algún campo de resultado tenga texto (no vacío)
        wait.until(
            EC.text_to_be_present_in_element(
                (By.CSS_SELECTOR, "#nombre-completo, #nombres, .resultado, [id*='nombre']"),
                ""  # cualquier texto no vacío
            )
        )
        time.sleep(1.0)  # pequeña espera extra para que el DOM se estabilice

        # ── 4. Extraer campos con múltiples selectores de fallback ──
        def get_text(*selectors):
            for sel in selectors:
                try:
                    el = driver.find_element(By.CSS_SELECTOR, sel)
                    txt = el.text.strip() or el.get_attribute("value", "").strip()
                    if txt:
                        return txt
                except Exception:
                    continue
            return ""

        resultado = {
            "nombres":             get_text("#nombres", "[id*='nombres']", ".nombres"),
            "apellido_paterno":    get_text("#apellido-paterno", "[id*='paterno']", ".apellido-paterno"),
            "apellido_materno":    get_text("#apellido-materno", "[id*='materno']", ".apellido-materno"),
            "nombre_completo":     get_text("#nombre-completo", "[id*='nombre-completo']", ".nombre-completo"),
            "codigo_verificacion": get_text("#codigo-verificacion", "[id*='verificacion']", ".codigo"),
            "sexo":                get_text("#sexo", "[id*='sexo']", ".sexo"),
            "fecha_nacimiento":    get_text("#fecha-nacimiento", "[id*='nacimiento']", ".fecha"),
        }

        # Validación mínima: si no obtuvimos ningún dato real
        if not any(resultado.values()):
            # Intentar leer cualquier mensaje de error que muestre el sitio
            try:
                error_msg = driver.find_element(By.CSS_SELECTOR, ".error, .alert, [id*='error']").text
            except Exception:
                error_msg = "No se encontraron datos para ese DNI."
            raise RuntimeError(error_msg)

        resultado["dni"] = dni
        return resultado

    finally:
        driver.quit()


# ──────────────────────────────────────────────
#  ENDPOINTS
# ──────────────────────────────────────────────

@app.route("/api/dni/<string:dni>", methods=["GET"])
def consultar_dni(dni):
    """
    GET /api/dni/12345678
    Retorna JSON con los datos del DNI consultado.
    """
    try:
        datos = scrape_dni(dni)
        return jsonify({"ok": True, "data": datos}), 200

    except ValueError as e:
        return jsonify({"ok": False, "error": str(e)}), 400

    except RuntimeError as e:
        return jsonify({"ok": False, "error": str(e)}), 404

    except Exception as e:
        return jsonify({"ok": False, "error": f"Error interno: {str(e)}"}), 500


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"ok": True, "status": "running"}), 200


if __name__ == "__main__":
    print("=" * 50)
    print("  PhoneCorp - Servidor DNI con Selenium")
    print("  Endpoint: http://localhost:5000/api/dni/{8_digitos}")
    print("=" * 50)
    app.run(debug=False, port=5000)
