FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .

# Install all requirements
RUN pip install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

COPY . .

CMD ["python", "Server.py"]
