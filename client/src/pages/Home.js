import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import ListCard from '../components/ListCard';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { getEmojiStatusAmount } from '../utils.js';
import SpinnerWheel from '../components/Spinner';
import '../styles/Home.css';

export default function Home() {
    const [loading, setLoading] = useState(true);
    const [recentLists, setRecentLists] = useState([]);
    const [popularLists, setPopularLists] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('todos');
    const { token, user } = useSelector(state => state.auth);
    const recentListIds = useSelector(state => state.recentLists);

    useEffect(() => {
        const fetchPopularLists = async (category) => {
            try {
                const response = await axios.get('/api/termlists/popular', {
                    params: { category: category === 'todos' ? '' : category }
                });
                setPopularLists(response.data);
            } catch (error) {
                console.error('Error fetching popular lists:', error);
            } finally {
                setLoading(false);
            }
        }; 

        const fetchRecentLists = async () => {
            try {
                const response = await axios.get('/api/termlists/recent', {
                    params: { ids: recentListIds.join(',') }
                });
                setRecentLists(response.data);
            } catch (error) {
                console.error('Error fetching recent lists:', error);
            } finally {
                setLoading(false);
            }
        };

        if (recentListIds.length > 0) {
            fetchRecentLists();
        } else {
            setLoading(false); // Se não houver listas recentes, definimos o loading como false
        }

        fetchPopularLists(selectedCategory);
    }, [token, recentListIds, selectedCategory]);

    const isLoggedIn = !!user;

    if (loading) { return <SpinnerWheel /> }

    return (
        <Container fluid className="px-5 py-4 home-container">
            {recentLists.length > 0 && (
                <>
                    <h2 className="text-center custom-heading">LISTAS VISITADAS RECENTEMENTE</h2>
                    <Row className="mt-3 mb-5">
                        {recentLists.map((list) => (
                            <Col md={4} key={list._id}>
                                <ListCard
                                    id={list._id}
                                    title={list.listName}
                                    terms={list.terms.length}
                                    category={list.category}
                                    author={list.author.username}
                                    avatar={list.author.avatar}
                                    isAuthor={isLoggedIn && list.author._id === user.id}
                                    isFavourited={isLoggedIn && list.usersWhoFavourited.includes(user.id)}
                                    emojiStatusAmount={getEmojiStatusAmount(list.terms, isLoggedIn ? user.id : null)}
                                />
                            </Col>
                        ))}
                    </Row>
                    <hr />
                </>
            )}
            <h2 className="text-center custom-heading mt-4">LISTAS POPULARES</h2>
            <Form.Select
                className="mb-4"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
            >
                <option value="todos">Todos</option>
                <option value="idiomas">Idiomas</option>
                <option value="entretenimento">Entretenimento</option>
                <option value="matemática">Matemática</option>
                <option value="física">Física</option>
                <option value="química">Química</option>
                <option value="biologia">Biologia</option>
                <option value="história">História</option>
                <option value="geografia">Geografia</option>
                <option value="filosofia">Filosofia</option>
            </Form.Select>
            <Row className="mt-3">
                {popularLists.map((list) => (
                    <Col md={4} key={list._id}>
                        <ListCard
                            id={list._id}
                            title={list.listName}
                            terms={list.terms.length}
                            category={list.category}
                            author={list.author.username}
                            avatar={list.author.avatar}
                            isAuthor={isLoggedIn && list.author._id === user.id}
                            isFavourited={isLoggedIn && list.usersWhoFavourited.includes(user.id)}
                            emojiStatusAmount={getEmojiStatusAmount(list.terms, isLoggedIn ? user.id : null)}
                        />
                    </Col>
                ))}
            </Row>
        </Container>
    );
}
