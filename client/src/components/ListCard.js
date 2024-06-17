import axios from 'axios';
import { useSelector } from 'react-redux';
import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPuzzlePiece, faBookmark } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { statusIcons } from '../utils.js';
import '../styles/ListCard.css';

export default function ListCard({ id, title, terms, category, author, avatar, emojiStatusAmount, isAuthor, isFavourited: initialIsFavourited }) {
    const token = useSelector(state => state.auth.token);
    const navigate = useNavigate();
    const [isFavourited, setIsFavourited] = useState(initialIsFavourited);

    const handleFavouriteClick = async (e) => {
        e.stopPropagation();
        try {
            const response = await axios.put(`/api/termlists/${id}/favourite`, {}, {
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

    const handleViewClick = () => {
        navigate(`/listas/${id}`);
    };

    return (
        <Card
            className="mb-4"
            onClick={handleViewClick}
            style={{ cursor: 'pointer', transition: 'border-color 0.3s', height: '100%' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0d6efd'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#dee2e6'}
        >
            <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <Card.Title className="flex-grow-1" style={{ wordBreak: 'break-word' }}>{title}</Card.Title>
                    <div className="d-flex align-items-center gap-2">
                        <FontAwesomeIcon
                            icon={faBookmark}
                            className={`${isFavourited ? 'bookmarkIconFavourited' : 'bookmarkIconNotFavourited'}`}
                            size="lg"
                            onClick={handleFavouriteClick}
                            style={{ cursor: 'pointer', marginLeft: '10px' }}
                        />
                        {terms >= 4 ? (
                            <Link to={`/listas/${id}/jogar`} onClick={e => e.stopPropagation()}>
                                <FontAwesomeIcon icon={faPuzzlePiece} size="lg" />
                            </Link>
                        ) : (
                            <FontAwesomeIcon icon={faPuzzlePiece} size="lg" className="icon-disabled" />
                        )}
                        {isAuthor && (
                            <Link to={`/listas/${id}/editar`} onClick={e => e.stopPropagation()}>
                                <FontAwesomeIcon icon={faEdit} size="lg" />
                            </Link>
                        )}
                    </div>
                </div>
                <Card.Text className='mb-2'>{terms} termos</Card.Text>
                <Card.Text className='mb-2'>Categoria: {category}</Card.Text>
                <div className="d-flex align-items-center">
                    <Card.Text className='mb-0'>Autor: {author}</Card.Text>
                    <img
                        src={avatar}
                        alt={`${author}'s avatar`}
                        className="rounded-circle"
                        style={{ width: '32px', height: '32px', marginLeft: '10px' }}
                    />
                </div>

                <div className="d-flex justify-content-between mt-auto">
                    {Object.entries(statusIcons).reverse().map(([key, { icon, color }], idx) => (
                        <div key={key} className="text-center">
                            <FontAwesomeIcon icon={icon} size="lg" style={{ color }} />
                            <div>{emojiStatusAmount[idx]}</div>
                        </div>
                    ))}
                </div>
            </Card.Body>
        </Card>
    );
}
