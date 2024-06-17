import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faInfoCircle, faTrash, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../styles/EditList.css';
import { handleError, handleSuccess, getTermStatus, statusIcons } from '../utils.js';

export default function EditList() {
    const { token, user } = useSelector((state) => state.auth);
    const { listId } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [terms, setTerms] = useState([]);

    useEffect(() => {
        const fetchTermList = async () => {
            try {
                const response = await fetch(`/api/termlists/${listId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();

                if (data.author._id !== user.id) {
                    navigate('/');
                    return;
                }

                setTitle(data.listName);
                setDescription(data.description);
                setIsPublic(data.isPublic);
                setTerms(data.terms.map(term => ({
                    _id: term._id,
                    term: term.term,
                    definition: term.definition,
                    reminder: term.reminder,
                    statuses: term.statuses,
                    createdAt: term.createdAt
                })));
            } catch (error) {
                console.error('Error fetching term list:', error);
                handleError('Erro ao carregar lista de termos!');
            }
        };

        fetchTermList();

    }, [listId, user.id, navigate, token]);

    // Configuração do salvamento automático
    useEffect(() => {
        const intervalId = setInterval(() => {
            handleSubmit(null, false); // Chama a função handleSubmit sem um evento e sem mostrar notificação
        }, 20000); // 20 segundos

        return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar o componente
    }, [title, description, isPublic, terms]); // Dependências do useEffect

    const handleAddTerm = () => {
        if (terms.length < 300) {
            setTerms([...terms, { term: '', definition: '', reminder: '' }]);
        } else {
            handleError('Não é possível adicionar mais de 300 termos.');
        }
    };

    const handleTermChange = (index, field, value) => {
        if (value.length <= 100) {
            const newTerms = [...terms];
            newTerms[index][field] = value;
            setTerms(newTerms);
        }
    };

    const handleRemoveTerm = (index) => {
        const newTerms = terms.filter((_, termIndex) => termIndex !== index);
        setTerms(newTerms);
    };

    const handleMoveTermUp = (index) => {
        if (index === 0) return;
        const newTerms = [...terms];
        const temp = newTerms[index - 1];
        newTerms[index - 1] = newTerms[index];
        newTerms[index] = temp;
        setTerms(newTerms);
    };

    const handleMoveTermDown = (index) => {
        if (index === terms.length - 1) return;
        const newTerms = [...terms];
        const temp = newTerms[index + 1];
        newTerms[index + 1] = newTerms[index];
        newTerms[index] = temp;
        setTerms(newTerms);
    };

    const handleDeleteList = async () => {
        if (!window.confirm('Deseja realmente deletar esta lista?')) return;
        try {
            const response = await fetch(`/api/termlists/${listId}/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Network response was not ok');

            handleSuccess('Lista deletada com sucesso!');
            navigate('/');
        } catch (error) {
            handleError('Erro ao deletar lista!');
            console.error('Error deleting term list:', error);
        }
    };

    const handleSubmit = async (event, showNotification = true) => {
        if (event) event.preventDefault();

        try {
            const response = await fetch(`/api/termlists/${listId}/edit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ listName: title, description, terms, isPublic })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            if (showNotification) handleSuccess('Lista atualizada com sucesso!');
        } catch (error) {
            if (showNotification) handleError('Erro ao atualizar lista!');
            console.error('Error updating terms:', error);
        }
    };

    return (
        <Container fluid className="px-3 py-4 my-5 edit-list-container">
            <OverlayTrigger
                placement="right"
                overlay={
                    <Tooltip id="info-tooltip">
                        Um salvamento automático ocorre a cada 30 segundos
                    </Tooltip>
                }
            >
                <FontAwesomeIcon color='#444' size='lg' icon={faInfoCircle} />
            </OverlayTrigger>
            <div className='d-flex align-items-baseline justify-content-center text-center'>
                <h2 className='text-primary'>EDITAR LISTA</h2>
                <FontAwesomeIcon
                    icon={faTrash}
                    onClick={handleDeleteList}
                    className="delete-icon"
                />
            </div>

            <Form onSubmit={(e) => handleSubmit(e, true)}>
                <Form.Group controlId="formTitle">
                    <Form.Label>Título da Lista:</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Digite o título da lista"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mb-3"
                        minLength={1}
                        maxLength={50}
                    />
                </Form.Group>
                <Form.Group controlId="formDescription">
                    <Form.Label>Descrição (opcional):</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Digite a descrição da lista"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mb-3"
                        maxLength={250}
                    />
                </Form.Group>
                <Form.Group controlId="formIsPublic">
                    <Form.Check
                        type="checkbox"
                        label="Visibilidade pública"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="mb-4"
                    />
                </Form.Group>

                {terms.map((term, index) => (
                    <div key={index} className="term-group mb-4 position-relative">
                        <Row>
                            <Col className='mb-2 d-flex gap-2 align-items-start justify-content-start'>
                                <span>{index + 1}.</span>
                                <FontAwesomeIcon
                                    icon={statusIcons[getTermStatus(term.statuses, user.id)].icon}
                                    size="lg"
                                    style={{ color: statusIcons[getTermStatus(term.statuses, user.id)].color }}
                                />
                                <FontAwesomeIcon icon={faArrowUp} size="lg" className="arrow-icon" onClick={() => handleMoveTermUp(index)} />
                                <FontAwesomeIcon icon={faArrowDown} size="lg" className="arrow-icon" onClick={() => handleMoveTermDown(index)} />
                                <FontAwesomeIcon icon={faTrash} size="lg" className="delete-icon ms-auto" onClick={() => handleRemoveTerm(index)} />
                            </Col>
                        </Row>

                        <Row className="align-items-center mb-1">
                            <Col md={6}>
                                <Form.Group controlId={`formTerm${index}`}>
                                    <Form.Label>Termo:</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        placeholder="Termo"
                                        value={term.term}
                                        onChange={(e) => handleTermChange(index, 'term', e.target.value)}
                                        className="mb-1"
                                        minLength={1}
                                        maxLength={100}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId={`formDefinition${index}`}>
                                    <Form.Label>Definição:</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        placeholder="Definição"
                                        value={term.definition}
                                        onChange={(e) => handleTermChange(index, 'definition', e.target.value)}
                                        className="mb-1"
                                        minLength={1}
                                        maxLength={100}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group controlId={`formReminder${index}`}>
                                    <Form.Label>Lembrete (opcional):</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        placeholder="Lembrete"
                                        value={term.reminder}
                                        onChange={(e) => handleTermChange(index, 'reminder', e.target.value)}
                                        className="mb-1"
                                        maxLength={100}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                ))}
                <div className="text-center mb-4">
                    <Button variant="outline-primary" onClick={handleAddTerm}>
                        <FontAwesomeIcon icon={faPlus} /> Adicionar Termo
                    </Button>
                </div>
                <div className="text-center">
                    <Button variant="primary" type="submit" className="px-5">
                        Salvar Alterações
                    </Button>
                </div>
            </Form>
        </Container>
    );
}
