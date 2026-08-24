FROM python:3.14-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# collectstatic only needs settings to import cleanly — it never touches the
# database — so these placeholders are fine at build time. Real values are
# supplied as container env vars at runtime and take precedence.
ENV SECRET_KEY=collectstatic-build-placeholder \
    DEBUG=False \
    DATABASE_URL=sqlite:///build.db
RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn bakery_backend.wsgi:application --bind 0.0.0.0:8000 --workers 3"]
