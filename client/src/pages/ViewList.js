import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Container, Form, Button, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPuzzlePiece, faBookmark, faSyncAlt, faInfoCircle, faEdit } from '@fortawesome/free-solid-svg-icons';
import '../styles/ViewList.css';
import { useDispatch } from 'react-redux';
import { countStatus, handleSuccess, statusIcons } from '../utils';
import { addRecentList } from '../redux/slices/recentlyVisitedListsSlice.js';
import SpinnerWheel from '../components/Spinner';

export default function ViewList() {
    const dispatch = useDispatch();
    const { user, token } = useSelector((state) => state.auth);
    const { listId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState('original-order');
    const [listData, setListData] = useState(null);
    const [originalTerms, setOriginalTerms] = useState([]);
    const [statusCounts, setStatusCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [showEditListBtn, setShowEditListBtn] = useState(false);
    const [isFavourited, setIsFavourited] = useState(false);
    const isLoggedIn = !!user;
    
    useEffect(() => {
        const fetchListData = async () => {
            try {
                const response = await axios.get(`/api/termlists/${listId}`);
                const data = response.data;

                const isAuthor = user && data.author._id === user.id;
                const isPublic = data.isPublic;

                if (isAuthor) setShowEditListBtn(true);

                if (!isPublic && !isAuthor) {
                    navigate('/');
                } else {
                    setListData(data);
                    dispatch(addRecentList(data._id));
                    setIsFavourited(isLoggedIn && data.usersWhoFavourited.includes(user.id))
                    setOriginalTerms(data.terms);
                    if (user) {
                        let counts = countStatus(data.terms, user.id);
                        setStatusCounts(counts);
                    } else {
                        setStatusCounts(countStatus(data.terms, null));
                    }
                }

                console.log(data);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching list data:', error);
                setLoading(false);
            }
        };
        fetchListData();
    }, [listId, user, navigate]);

    const handleFavouriteClick = async (e) => {
        e.stopPropagation();
        try {
            const response = await axios.put(`/api/termlists/${listData._id}/favourite`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                setIsFavourited(!isFavourited);
                return;
            }
            console.error('Error toggling favourite:', response.data.error);
        } catch (error) {
            console.error('Error toggling favourite:', error);
        }
    };

    const handleOrderChange = (e) => {
        const selectedOrder = e.target.value;
        setOrder(selectedOrder);
        let sortedTerms;

        switch (selectedOrder) {
            case 'original-order':
                sortedTerms = [...originalTerms];
                break;
            case 'worst-status':
                sortedTerms = [...listData.terms].sort((a, b) => getUserStatus(a) - getUserStatus(b));
                break;
            case 'best-status':
                sortedTerms = [...listData.terms].sort((a, b) => getUserStatus(b) - getUserStatus(a));
                break;
            default:
                sortedTerms = listData.terms;
        }

        setListData({
            ...listData,
            terms: sortedTerms
        });
    };

    const getUserStatus = (term) => {
        if (!user) {
            return 4;
        }
        const userStatus = term.statuses.find(status => status.user === user.id);
        return userStatus ? userStatus.status : 4;
    };

    const handleResetStatus = async () => {
        if (!window.confirm('Deseja realmente resetar seu progresso?')) return;

        try {
            await axios.post(`/api/termlists/${listId}/reset-status`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const response = await axios.get(`/api/termlists/${listId}`);
            setListData(response.data);
            setOriginalTerms(response.data.terms);
            setStatusCounts(countStatus(response.data.terms, user ? user.id : null));
            handleSuccess('Status resetado com sucesso!');
        } catch (error) {
            console.error('Error resetting status:', error);
        }
    };

    if (loading) { return <SpinnerWheel /> }

    return (
        <Container fluid className="my-5 view-list-container">
            <div className="text-center">
                <h2 className='text-primary'>
                    {listData.listName}
                    <OverlayTrigger
                        placement="right"
                        overlay={
                            <Tooltip id="info-tooltip">
                                Termos: {listData.terms.length}<br />
                                Autor: {listData.author.username}<br />
                                Categoria: {listData.category}<br />
                                Data de criação: {new Date(listData.createdAt).toLocaleDateString()}
                            </Tooltip>
                        }
                    >
                        <FontAwesomeIcon color='#444' size='xs' icon={faInfoCircle} className='ms-2' />
                    </OverlayTrigger>
                    <FontAwesomeIcon
                        icon={faBookmark}
                        className={`${isFavourited ? 'bookmarkIconFavourited' : 'bookmarkIconNotFavourited'}`}
                        size="xs"
                        onClick={handleFavouriteClick}
                        style={{ cursor: 'pointer', marginLeft: '10px' }}
                    />
                </h2>
                <p>{listData.description}</p>
            </div>
            <hr />
            <div className="d-flex align-items-baseline justify-content-center gap-2">
                <h3 className="text-center">STATUS</h3>
                <FontAwesomeIcon onClick={handleResetStatus} icon={faSyncAlt} className='reset-icon' />
            </div>
            <div className="d-flex justify-content-center gap-3 mb-4">
                {Object.keys(statusIcons).reverse().map((status) => (
                    <div key={status} className="text-center">
                        <FontAwesomeIcon icon={statusIcons[status].icon} size="lg" style={{ color: statusIcons[status].color }} />
                        <div>{statusCounts[status] || 0}</div>
                    </div>
                ))}
            </div>

            <div className="text-center mb-3">
                {listData.terms.length >= 4 ? (
                    <Button variant="primary" className='me-2' onClick={() => navigate(`/listas/${listId}/jogar`)}>
                        Jogar Quiz <FontAwesomeIcon icon={faPuzzlePiece} size='lg' className='ms-2' />
                    </Button>
                ) : (
                    <Button variant="primary" disabled>
                        Jogar Quiz <FontAwesomeIcon icon={faPuzzlePiece} size='lg' className='ms-2' />
                    </Button>
                )}
                {showEditListBtn && <Button onClick={() => navigate(`/listas/${listId}/editar`)}>Editar <FontAwesomeIcon icon={faEdit} size='lg' className='ms-2' /></Button>}
            </div>
            <hr />
            <Form.Group controlId="orderSelect" className="mb-4">
                <Form.Label>Ordenar por:</Form.Label>
                <Form.Control as="select" value={order} onChange={handleOrderChange}>
                    <option value="original-order">Ordem Original</option>
                    <option value="best-status">Melhor Status</option>
                    <option value="worst-status">Pior Status</option>
                </Form.Control>
            </Form.Group>
            <div className="terms-container">
                {listData.terms.map((term, index) => (
                    <div key={index} className="term-group mb-4 p-3">
                        <Row className="align-items-center">
                            <Col md={6}>
                                <div>
                                    <p className="mb-2">Termo: {term.term}</p>
                                </div>
                            </Col>
                            <Col md={6}>
                                <p className="mb-2">Definição: {term.definition}</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <p className="mb-1">Lembrete: {term.reminder}</p>
                            </Col>
                            <Col md={6}>
                                <p className="mb-1">
                                    Status: {
                                        <FontAwesomeIcon
                                            icon={statusIcons[getUserStatus(term)].icon}
                                            style={{ color: statusIcons[getUserStatus(term)].color }}
                                        />}
                                </p>
                            </Col>
                        </Row>
                    </div>
                ))}
            </div>
        </Container>
    );
}
