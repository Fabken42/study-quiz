// src/components/Login.js
import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, loginWithGoogle } from '../redux/slices/authSlice.js';
import { auth, googleProvider, signInWithPopup } from '../firebaseConfig.js';
import '../styles/Login.css';
import { handleError, handleSuccess } from '../utils.js';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const authStatus = useSelector((state) => state.auth.status);
    const authError = useSelector((state) => state.auth.error);

    const handleSubmit = (e) => {
        e.preventDefault();
        const loginData = { username, password };
        dispatch(loginUser(loginData))
            .unwrap()
            .then(() => {
                handleSuccess('Login bem-sucedido!');
                navigate('/');
            })
            .catch((error) => handleError(`Erro ao fazer login: ${error}`));
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const googleData = {
                username: user.displayName,
                email: user.email,
            };
            dispatch(loginWithGoogle(googleData))
                .unwrap()
                .then(() => {
                    handleSuccess('Login bem-sucedido com Google!');
                    navigate('/');
                })
                .catch((error) => handleError(`Erro ao fazer login com Google: ${error}`));
        } catch (error) {
            handleError(`Erro ao fazer login com Google: ${error.message}`);
        }
    };

    return (
        <Container fluid className="mt-5 p-4 login-container">
            <h2 className="text-center text-primary mb-4">ENTRAR</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formUsername">
                    <Form.Label>Nome de Usuário:</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Digite seu nome de usuário"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mb-3"
                    />
                </Form.Group>
                <Form.Group controlId="formPassword">
                    <Form.Label>Senha:</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mb-4"
                    />
                </Form.Group>
                <div className="text-center">
                    <Button variant="primary" type="submit" className="px-5">
                        Entrar
                    </Button>
                    <Button variant="outline-danger" className="px-5 mt-2" onClick={handleGoogleSignIn}>
                        Continuar com Google
                    </Button>
                </div>
            </Form>
            <p className="text-center mt-4">
                Não tem uma conta? <Link to="/cadastrar">Criar</Link>
            </p>
            {authStatus === 'loading' && <p className="text-center">Entrando...</p>}
            {authError && <p className="text-center text-danger">{authError}</p>}
        </Container>
    );
}
