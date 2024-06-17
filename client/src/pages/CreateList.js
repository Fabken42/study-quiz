import React, { useState } from 'react';
import { Container, Form, Button, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import categories from '../components/listCategories.json';
import { handleError, handleSuccess } from '../utils';
import '../styles/CreateList.css';

export default function CreateList() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = {
            listName: title,
            description,
            category,
            isPublic
        };

        try {
            const response = await fetch('/api/termlists/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();

                handleSuccess('Lista criada com sucesso!');
                navigate(`/listas/${result._id}/editar`);
            } else {
                const errorData = await response.json();
                handleError(errorData.message || 'Erro ao criar lista');
            }
        } catch (error) {
            handleError('Erro ao criar lista: ' + error.message);
        }
    };

    return (
        <Container fluid="md" className="p-5 create-list-container">
            <h2 className="text-center mb-4 custom-heading">Criar Lista</h2>
            <Form onSubmit={handleSubmit} className="shadow p-4 rounded bg-light">
                <Form.Group controlId="formTitle" className="mb-3">
                    <Form.Label>Título:</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="ex.: Inglês básico"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="rounded-pill"
                    />
                </Form.Group>

                <Form.Group controlId="formDescription" className="mb-3">
                    <Form.Label>Descrição:</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="ex.: As 100 palavras mais utilizadas em inglês"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="rounded"
                    />
                </Form.Group>

                <Form.Group controlId="formCategory" className="mb-3">
                    <Form.Label>Categoria:</Form.Label>
                    <ToggleButtonGroup
                        type="radio"
                        name="categories"
                        value={category}
                        onChange={(val) => setCategory(val)}
                        className="d-flex flex-wrap"
                    >
                        {categories.map((cat, index) => (
                            <ToggleButton
                                key={index}
                                id={`category-${index}`}
                                type="radio"
                                variant="outline-primary"
                                name="category"
                                value={cat}
                                className="m-1 rounded-pill"
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Form.Group>

                <Form.Group controlId="formPrivacy" className="mb-4">
                    <Form.Label>Visibilidade:</Form.Label>

                    <div>
                        <Form.Check
                            type="radio"
                            id="public"
                            label="Pública"
                            name="privacy"
                            value="public"
                            checked={isPublic}
                            onChange={() => setIsPublic(true)}
                            className="me-3"
                        />
                        <Form.Check
                            type="radio"
                            id="private"
                            label="Privada"
                            name="privacy"
                            value="private"
                            checked={!isPublic}
                            onChange={() => setIsPublic(false)}
                        />
                    </div>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 rounded-pill">
                    Enviar
                </Button>
            </Form>
        </Container>
    );
}
