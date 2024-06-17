import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import ListCard from '../components/ListCard';
import axios from 'axios';
import { useSelector } from 'react-redux';
import SpinnerWheel from '../components/Spinner';
import { getEmojiStatusAmount } from '../utils.js';
import '../styles/UserLists.css'; // Import the CSS file

export default function UserLists() {
    const [loading, setLoading] = useState(true);
    const [favoriteLists, setFavoriteLists] = useState([]);
    const [userLists, setUserLists] = useState([]);
    const { token, user } = useSelector(state => state.auth);

    useEffect(() => {
        const fetchLists = async () => {
            try {
                const response = await axios.get(`/api/users/${user.id}/termlists`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setFavoriteLists(response.data.favouritedLists);
                setUserLists(response.data.createdLists);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching lists:', error);
            }
        };

        fetchLists();
    }, [token, user.id]);

    if (loading) { return <SpinnerWheel /> }

    return (
        <Container fluid className="px-5 py-4 userlists-container">
            {favoriteLists.length > 0 && (
                <>
                    <h2 className="text-center custom-heading">LISTAS FAVORITADAS</h2>
                    <Row className="mt-3 mb-5">
                        {favoriteLists.map((list) => (
                            <Col md={4} key={list._id}>
                                <ListCard
                                    id={list._id}
                                    title={list.listName}
                                    terms={list.terms.length}
                                    category={list.category}
                                    author={list.author.username}
                                    avatar={list.author.avatar}
                                    isAuthor={list.author._id === user.id}
                                    isFavourited={true}
                                    emojiStatusAmount={getEmojiStatusAmount(list.terms, user.id)}
                                />
                            </Col>
                        ))}
                    </Row>
                    <hr />
                </>
            )}
            {userLists.length > 0 && (
                <>
                    <h2 className="text-center custom-heading mt-4">SUAS LISTAS</h2>
                    <Row className="mt-3">
                        {userLists.map((list) => (
                            <Col md={4} key={list._id}>
                                <ListCard
                                    list={list}
                                    id={list._id}
                                    title={list.listName}
                                    terms={list.terms.length}
                                    category={list.category}
                                    author={list.author.username}
                                    avatar={list.author.avatar}
                                    isAuthor={list.author._id === user.id}
                                    isFavourited={list.usersWhoFavourited.includes(user.id)}
                                    emojiStatusAmount={getEmojiStatusAmount(list.terms, user.id)}
                                />
                            </Col>
                        ))}
                    </Row>
                </>
            )}
        </Container>
    );
}
