// src/components/Register.js
import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, loginWithGoogle } from '../redux/slices/authSlice.js';
import { auth, googleProvider, signInWithPopup } from '../firebaseConfig.js';
import '../styles/Register.css';
import { handleError, handleSuccess } from '../utils.js';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const authStatus = useSelector((state) => state.auth.status);
    const authError = useSelector((state) => state.auth.error);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            handleError('As senhas não coincidem!');
            return;
        }
        const registerData = { username, email, password };
        dispatch(registerUser(registerData))
            .unwrap()
            .then(() => {
                handleSuccess('Registrado com sucesso!');
                navigate('/entrar');
            })
            .catch((error) => handleError(`Erro ao registrar: ${error}`));
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
        <Container fluid className="mt-5 p-4 register-container">
            <h2 className="text-center text-primary mb-4">CRIAR CONTA</h2>
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
                <Form.Group controlId="formEmail">
                    <Form.Label>Email:</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Digite seu email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        className="mb-3"
                    />
                </Form.Group>
                <Form.Group controlId="formConfirmPassword">
                    <Form.Label>Confirmar Senha:</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Confirme sua senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mb-4"
                    />
                </Form.Group>
                <div className="text-center">
                    <Button variant="primary" type="submit" className="px-5">
                        Criar
                    </Button>
                    <Button variant="outline-danger" className="px-5 mt-2" onClick={handleGoogleSignIn}>
                        Continuar com Google
                    </Button>
                </div>
            </Form>
            <p className="text-center mt-4">
                Já tem uma conta? <Link to="/entrar">Entrar</Link>
            </p>
            {authStatus === 'loading' && <p className="text-center">Registrando...</p>}
            {authError && <p className="text-center text-danger">{authError}</p>}
        </Container>
    );
}
