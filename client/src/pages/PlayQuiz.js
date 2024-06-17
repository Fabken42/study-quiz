import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faCheck, faTimes, faGrinStars } from '@fortawesome/free-solid-svg-icons';
import '../styles/PlayQuiz.css';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { statusIcons } from '../utils.js';

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

function PlayQuiz() {
    const navigate = useNavigate();
    const { listId } = useParams();
    const user = useSelector(state => state.auth.user);
    const [terms, setTerms] = useState([]);
    const [userStatuses, setUserStatuses] = useState({});
    const [currentTerm, setCurrentTerm] = useState({});
    const [selectedDef, setSelectedDef] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [definitions, setDefinitions] = useState([]);
    const [config, setConfig] = useState({ includePerfect: true, rounds: 10 });
    const [isConfigured, setIsConfigured] = useState(false);
    const [termPositions, setTermPositions] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [correctAns, setCorrectAns] = useState(0);
    const [wrongAns, setWrongAns] = useState(0);

    useEffect(() => {
        if (isConfigured) fetchQuizTerms();
    }, [isConfigured]);

    useEffect(() => {
        if (terms.length && termPositions.length === config.rounds) getNextTerm(terms);
    }, [terms, termPositions]);

    const fetchQuizTerms = async () => {
        try {
            const response = await axios.get(`/api/termlists/${listId}/play`, {
                params: {
                    includePerfect: config.includePerfect,
                    rounds: config.rounds
                }
            });
            configureTermsStatuses(response.data);
            setTerms(response.data);
            setTermPositions(new Array(config.rounds).fill().map((_, index) => index % response.data.length));
        } catch (error) {
            navigate('/');
            console.error('Error fetching quiz terms:', error);
        }
    }

    const configureTermsStatuses = (terms) => {
        if (terms.length > 0) {
            const statusesMap = terms.reduce((acc, term) => {
                const userStatus = term.statuses.find(status => status.user === user.id);
                if (userStatus) {
                    acc[term._id] = userStatus.status;
                } else {
                    acc[term._id] = 4;
                }
                return acc;
            }, {});

            setUserStatuses(statusesMap);
        }
    }

    const updateTermStatuses = async (num, isCorrect) => {
        setUserStatuses(prevState => ({
            ...prevState,
            [currentTerm._id]: Math.min(7, Math.max(1, prevState[currentTerm._id] + num))
        }));

        if (user) {
            try {
                await axios.put(`/api/terms/${currentTerm._id}/updateStatus`, {
                    userId: user.id,
                    isCorrect
                });
            } catch (error) {
                navigate('/');
                console.error('Error updating term status:', error);
            }
        }
    }

    const getNextTerm = (termsData = terms) => {
        if (!termPositions.length && terms.length) {
            setGameOver(true);
            return;
        }

        const [currentPosition, ...remainingPositions] = termPositions;
        setTermPositions(remainingPositions);

        const selectedTerm = termsData[currentPosition];
        const incorrectDefs = shuffleArray(
            termsData
                .filter((_, index) => index !== currentPosition)
                .map(term => term.definition)
        ).slice(0, 3);

        setCurrentTerm(selectedTerm);
        setDefinitions(shuffleArray([selectedTerm.definition, ...incorrectDefs]));
        setSelectedDef(null);
        setShowAnswer(false);
    }

    const handleDefinitionClick = async (def) => {
        setSelectedDef(def);
        setShowAnswer(true);

        const isCorrect = def === currentTerm.definition;
        if (isCorrect) {
            setCorrectAns(correctAns + 1);
            updateTermStatuses(1, true);
        } else {
            setWrongAns(wrongAns + 1);
            updateTermStatuses(-1, false);
        }
    }

    const handleConfigChange = (e) => {
        let { name, value } = e.target;
        value = parseInt(value);
        setConfig({ ...config, [name]: value });
    }

    const handleStartQuiz = () => {
        setIsConfigured(true);
    }

    const handleRestartQuiz = () => {
        setIsConfigured(false);
        setGameOver(false);
        setCorrectAns(0);
        setWrongAns(0);
        setTerms([]);
        setCurrentTerm({});
        setSelectedDef(null);
        setShowAnswer(false);
        setDefinitions([]);
        setTermPositions([]);
    }

    if (gameOver) {
        return (
            <Container fluid className="mt-5 play-quiz-container">
                <h2 className="text-center mb-4">Quiz Finalizado!</h2>
                <div className="text-center">
                    <p>
                        Acertos: {correctAns} <FontAwesomeIcon icon={faCheck} size="lg" className="ms-2" style={{ color: '#00FF00' }} />
                    </p>
                    <p>
                        Erros: {wrongAns} <FontAwesomeIcon icon={faTimes} size="lg" className="ms-2" style={{ color: '#FF0000' }} />
                    </p>
                    <Button size='lg' variant="primary" onClick={handleRestartQuiz}>
                        Jogar Novamente
                    </Button>
                </div>
            </Container>
        );
    }

    if (!isConfigured) {
        return (
            <Container fluid className="mt-5 play-quiz-container">
                <h2 className="text-center text-primary mb-4">CONFIGURAÇÕES</h2>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            label={
                                <div>
                                    Incluir termos com status perfeito
                                    <FontAwesomeIcon icon={faGrinStars} className="ms-2" size='lg' style={{ color: '#0000FF' }} />
                                </div>
                            }
                            name="includePerfect"
                            checked={config.includePerfect}
                            onChange={(e) => setConfig({ ...config, includePerfect: e.target.checked })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Rodadas:</Form.Label>
                        <Form.Control
                            as="select"
                            name="rounds"
                            value={config.rounds}
                            onChange={handleConfigChange}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </Form.Control>
                    </Form.Group>
                    <div className="text-center">
                        <Button size='lg' variant="primary" onClick={handleStartQuiz}>
                            Iniciar Quiz
                        </Button>
                    </div>
                </Form>
            </Container>
        );
    }

    return (
        <Container fluid className="mt-5 play-quiz-container">
            <div className="text-center mb-4 d-flex align-items-baseline justify-content-between term-container">
                <span className="question-number">{terms.indexOf(currentTerm) + 1}/{config.rounds}</span>
                <span className="d-flex align-items-baseline term-wrapper">
                    <FontAwesomeIcon
                        icon={statusIcons[userStatuses[currentTerm._id] || 4].icon}
                        size="lg"
                        className="me-2"
                        style={{ color: statusIcons[userStatuses[currentTerm._id] || 4].color }}
                    />
                    <span className="term-text">{currentTerm.term}</span>
                    <FontAwesomeIcon
                        icon={statusIcons[userStatuses[currentTerm._id] || 4].icon}
                        size="lg"
                        className="ms-2"
                        style={{ color: statusIcons[userStatuses[currentTerm._id] || 4].color }}
                    />
                </span>
                <OverlayTrigger
                    placement="right"
                    overlay={<Tooltip id={`tooltip-left`}>{currentTerm.reminder || '*sem lembrete*'}</Tooltip>}
                >
                    <FontAwesomeIcon icon={faInfoCircle} size="xl" className='info-icon me-2' onClick={() => navigator.clipboard.writeText(currentTerm.reminder)} />
                </OverlayTrigger>
            </div>

            <Row>
                {definitions.map((def, index) => (
                    <Col key={index} md={6} className="mb-3 text-center">
                        <Button
                            variant="outline-secondary"
                            className={`definition-btn ${showAnswer && (def === currentTerm.definition ? 'correct' : def === selectedDef ? 'incorrect' : '')}`}
                            onClick={() => !showAnswer && handleDefinitionClick(def)}
                        >
                            <div className="definition-content">
                                {def}
                            </div>
                        </Button>
                    </Col>
                ))}
            </Row>
            <div className="text-center mt-4">
                <Button size='lg' variant="primary" onClick={() => getNextTerm()} className="w-100">
                    {showAnswer ? 'Continuar' : 'Pular'}
                </Button>
            </div>
        </Container>
    );
}

export default PlayQuiz;
