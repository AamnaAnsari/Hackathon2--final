FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (optional: customize as needed)
RUN pip install --no-cache-dir --upgrade pip

# Install Python dependencies
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . /app

# Expose backend port
EXPOSE 8000

# Run the backend application
CMD ["python", "run.py"]
