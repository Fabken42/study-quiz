import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Header() {
    const { token, user } = useSelector((state) => state.auth);

    return (
        <Navbar bg="light" expand="sm" className='px-4'>
            <Navbar.Brand>
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <span className='text-primary'>Study </span><span className="text-secondary">Quiz</span>
                </Link>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="ms-auto">
                    <Nav.Link as={Link} to="/">Início</Nav.Link>
                    {user ?
                        <>
                            <Nav.Link as={Link} to="/criar-lista">Criar Lista</Nav.Link>
                            <Nav.Link as={Link} to={`/users/${user.username}/listas`}>Suas Listas</Nav.Link>
                            <Nav.Link as={Link} to="/perfil">
                                <img 
                                    src={user.avatar} 
                                    alt="Avatar" 
                                    style={{ width: '30px', height: '30px', borderRadius: '50%' }} 
                                />
                            </Nav.Link>
                        </> :
                        <>
                            <Nav.Link as={Link} to="/entrar">Entrar</Nav.Link>
                            <Nav.Link as={Link} to="/cadastrar">Cadastrar</Nav.Link>
                        </>
                    }
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}
