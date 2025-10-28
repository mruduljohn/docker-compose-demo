CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO todos (title, description, completed) VALUES
('Welcome to Docker Todo App', 'This is a sample todo to demonstrate Docker Compose', false),
('Complete Docker tutorial', 'Learn about Docker and Docker Compose', false);
