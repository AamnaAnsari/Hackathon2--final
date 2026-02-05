# Python 3.10 use karein (Kyunki aapne | operator use kiya hai)
FROM python:3.10

# Working directory
WORKDIR /app

# Requirements install karein
COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Baaki code copy karein
COPY backend/ .

# Server start karein
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]