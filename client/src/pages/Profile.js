import React, { useEffect, useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, updateUserProfile } from '../redux/slices/authSlice.js';
import axios from 'axios';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebaseConfig.js';
import '../styles/Profile.css';
import { handleError, handleSuccess } from '../utils.js';

export default function Profile() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState('https://via.placeholder.com/150');
    const [avatarFile, setAvatarFile] = useState(null);
    const { token, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        console.log(user);
        setUsername(user.username);
        setAvatar(user.avatar);
    }, [user]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatar(reader.result);
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let avatarUrl = avatar;

        if (avatarFile) {
            const avatarRef = ref(storage, `avatars/${user.id}-${avatarFile.name}`);
            await uploadBytes(avatarRef, avatarFile);
            avatarUrl = await getDownloadURL(avatarRef);
        }

        const profileData = { username, password, avatar: avatarUrl };

        try {
            await axios.put(`/api/users/${user.id}/edit-profile`, profileData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            handleSuccess('Perfil atualizado com sucesso!');
            dispatch(updateUserProfile({ ...user, username, avatar: avatarUrl }));
            navigate('/');
        } catch (error) {
            handleError(`Erro ao atualizar perfil: ${error.response.data.message}`);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/entrar');
    };

    return (
        <Container fluid className="my-5 profile-container">
            <h2 className="text-center custom-heading mb-4">Editar Perfil</h2>
            <Form onSubmit={handleSubmit} className="profile-form">
                <Form.Group className="text-center">
                    <img
                        src={avatar}
                        alt="Avatar"
                        className="rounded-circle mb-3 profile-avatar"
                        onClick={() => document.getElementById('avatarInput').click()}
                    />
                    <Form.Control
                        type="file"
                        id="avatarInput"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleAvatarChange}
                    />
                </Form.Group>
                <Form.Group controlId="formName">
                    <Form.Label>Novo nome:</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Alterar nome"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mb-3"
                    />
                </Form.Group>
                <Form.Group controlId="formPassword">
                    <Form.Label>Nova senha:</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Alterar senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mb-4"
                    />
                </Form.Group>
                <div className="text-center">
                    <Button variant="primary" type="submit" className="px-5">
                        Editar perfil
                    </Button>
                </div>
            </Form>
            <div className="text-center mt-3">
                <Button className="btn btn-danger" onClick={handleLogout}>Sair</Button>
            </div>
        </Container>
    );
}
