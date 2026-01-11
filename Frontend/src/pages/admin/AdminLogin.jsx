import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, 
  Lock, 
  Mail, 
  Key, 
  AlertTriangle, 
  Skull, 
  Eye, 
  EyeOff,
  Biohazard,
  LogIn,
  X,
  Target,
  Crosshair,
  Radar,
  Scan
} from 'lucide-react';

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showRoles, setShowRoles] = useState(true);
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const [isClicking, setIsClicking] = useState(false);
    const [showReticle, setShowReticle] = useState(false);
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const cursorRef = useRef(null);
    const cursorTrailRef = useRef([]);
    const trailLength = 10;

    // Custom Dangerous Cursor Effect
    useEffect(() => {
        const updateCursor = (e) => {
            setCursorPosition({ x: e.clientX, y: e.clientY });
            
            // Add to trail
            cursorTrailRef.current = [
                { x: e.clientX, y: e.clientY, time: Date.now() },
                ...cursorTrailRef.current.slice(0, trailLength - 1)
            ];

            // Show reticle when over interactive elements
            const target = e.target;
            const isInteractive = 
                target.tagName === 'BUTTON' || 
                target.tagName === 'INPUT' || 
                target.tagName === 'A' ||
                target.closest('button') || 
                target.closest('input') ||
                target.closest('a');
            
            setShowReticle(isInteractive);
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        document.addEventListener('mousemove', updateCursor);
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);

        // Hide default cursor
        document.body.style.cursor = 'none';

        return () => {
            document.removeEventListener('mousemove', updateCursor);
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'auto';
        };
    }, []);

    // 3D tilt effect
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = (e) => {
            const { left, top, width, height } = container.getBoundingClientRect();
            const x = (e.clientX - left) / width - 0.5;
            const y = (e.clientY - top) / height - 0.5;
            
            container.style.transform = `
                perspective(1000px)
                rotateY(${x * 10}deg)
                rotateX(${y * -10}deg)
                translateZ(0)
            `;
        };

        const handleMouseLeave = () => {
            container.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
        };

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.email || !formData.password) {
            setMessage({ 
                text: 'WARNING: All fields required for access', 
                type: 'error' 
            });
            setLoginAttempts(prev => prev + 1);
            return;
        }

        try {
            setLoading(true);
            setMessage({ text: '', type: '' });

            const response = await api.post('/admin/auth/login', formData);
            console.log('Login response:', response.data);

            if (response.data.success) {
                localStorage.setItem('adminData', JSON.stringify({
                    ...response.data.admin,
                    token: true,
                    loginTime: new Date().toISOString()
                }));

                localStorage.setItem('adminRole', response.data.admin.role);
                
                const role = response.data.admin.role;
                switch(role) {
                    case 'accountVerifier':
                        navigate('/admin/account-verifier');
                        break;
                    case 'superAdmin':
                        navigate('/admin/super-admin');
                        break;
                    case 'cardManager':
                        navigate('/admin/card-manager');
                        break;
                    case 'cashier':
                        navigate('/admin/cashier');
                        break;
                    default:
                        navigate('/admin/dashboard');
                }
            } else {
                setMessage({ 
                    text: 'ACCESS DENIED: ' + response.data.message, 
                    type: 'error' 
                });
                setLoginAttempts(prev => prev + 1);
            }
        } catch (error) {
            console.error('Login error details:', error);
            const attempts = loginAttempts + 1;
            setLoginAttempts(attempts);
            
            let warning = '';
            if (attempts >= 3) {
                warning = '⚠️ WARNING: Multiple failed attempts detected';
            }
            
            setMessage({ 
                text: `${warning} ACCESS VIOLATION: ${error.response?.data?.message || 'Unauthorized access attempt'}. Attempt #${attempts}`, 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { id: 'superAdmin', name: 'SUPER ADMIN', color: 'from-red-500 to-red-700', level: 'MAXIMUM', icon: Skull },
        { id: 'accountVerifier', name: 'ACCOUNT VERIFIER', color: 'from-purple-500 to-purple-700', level: 'HIGH', icon: Shield },
        { id: 'cardManager', name: 'CARD MANAGER', color: 'from-cyan-500 to-blue-600', level: 'MEDIUM', icon: Key },
        { id: 'cashier', name: 'CASHIER', color: 'from-green-500 to-emerald-600', level: 'STANDARD', icon: LogIn }
    ];

    return (
        <>
            {/* Custom Dangerous Cursors */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50">
                {/* Main Skull Cursor */}
                <div 
                    className="absolute transition-all duration-75 ease-out"
                    style={{
                        left: cursorPosition.x - 20,
                        top: cursorPosition.y - 20,
                        transform: `scale(${isClicking ? 0.9 : 1}) rotate(${cursorPosition.x * 0.05}deg)`
                    }}
                >
                    <div className="relative">
                        {/* Crosshair Reticle */}
                        {showReticle && (
                            <>
                                <div className="absolute -inset-4">
                                    <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-red-500 -translate-x-1/2"></div>
                                    <div className="absolute bottom-0 left-1/2 w-0.5 h-4 bg-red-500 -translate-x-1/2"></div>
                                    <div className="absolute left-0 top-1/2 w-4 h-0.5 bg-red-500 -translate-y-1/2"></div>
                                    <div className="absolute right-0 top-1/2 w-4 h-0.5 bg-red-500 -translate-y-1/2"></div>
                                    
                                    <div className="absolute inset-0 border-2 border-red-500/50 rounded-full animate-ping"></div>
                                </div>
                            </>
                        )}
                        
                        {/* Skull Cursor */}
                        <div className={`relative transition-all duration-200 ${
                            showReticle ? 'text-red-500 scale-125' : 'text-gray-400'
                        }`}>
                            {isClicking ? (
                                <Target className="w-10 h-10 animate-pulse" />
                            ) : (
                                <Crosshair className="w-10 h-10" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Cursor Trail - Danger Trail */}
                {cursorTrailRef.current.map((pos, index) => {
                    const opacity = 1 - (index / trailLength);
                    const scale = 0.5 + (index / trailLength) * 0.5;
                    
                    return (
                        <div
                            key={index}
                            className="absolute rounded-full transition-all duration-100 ease-linear"
                            style={{
                                left: pos.x - 4,
                                top: pos.y - 4,
                                width: '8px',
                                height: '8px',
                                background: `radial-gradient(circle, rgba(239, 68, 68, ${opacity}) 0%, rgba(239, 68, 68, 0) 70%)`,
                                transform: `scale(${scale})`,
                                filter: 'blur(1px)',
                                opacity: opacity * 0.7
                            }}
                        />
                    );
                })}

                {/* Click Explosion Effect */}
                {isClicking && (
                    <div 
                        className="absolute rounded-full animate-ping"
                        style={{
                            left: cursorPosition.x - 30,
                            top: cursorPosition.y - 30,
                            width: '60px',
                            height: '60px',
                            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0) 70%)',
                            border: '2px solid rgba(239, 68, 68, 0.5)'
                        }}
                    />
                )}

                {/* Scan Line */}
                <div 
                    className="absolute w-screen h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent"
                    style={{
                        top: cursorPosition.y,
                        left: 0,
                        filter: 'blur(1px)',
                        animation: 'scanHorizontal 2s linear infinite'
                    }}
                />

                {/* Targeting Lines */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-red-500/50 to-transparent"
                    style={{ left: cursorPosition.x }} />
                <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"
                    style={{ top: cursorPosition.y }} />
            </div>

            {/* Main Content */}
            <div className="min-h-screen relative overflow-hidden bg-gray-900" style={{ cursor: 'none' }}>
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
                    {/* Dangerous Pattern */}
                    <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: `
                            radial-gradient(circle at 25% 25%, rgba(220, 38, 38, 0.1) 2px, transparent 2px),
                            radial-gradient(circle at 75% 75%, rgba(220, 38, 38, 0.1) 2px, transparent 2px)
                        `,
                        backgroundSize: '60px 60px'
                    }}></div>
                    
                    {/* Animated Grid */}
                    <div className="absolute inset-0" style={{
                        backgroundImage: `
                            linear-gradient(rgba(220, 38, 38, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(220, 38, 38, 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px',
                        animation: 'pulse 2s infinite alternate'
                    }}></div>

                    {/* Biohazard Symbols */}
                    <div className="absolute top-1/4 left-1/4 animate-pulse">
                        <Biohazard className="w-24 h-24 text-red-500/10" />
                    </div>
                    <div className="absolute bottom-1/4 right-1/4 animate-pulse delay-1000">
                        <Biohazard className="w-24 h-24 text-red-500/10" />
                    </div>
                </div>

                {/* Warning Banner */}
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-900 to-black border-b border-red-700 py-3 px-4 z-20">
                    <div className="flex items-center justify-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                        <span className="text-red-300 font-mono text-sm tracking-wider">
                            ⚠️ RESTRICTED ACCESS - AUTHORIZED PERSONNEL ONLY ⚠️
                        </span>
                        <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                    </div>
                </div>

                <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                    <div 
                        ref={containerRef}
                        className="w-full max-w-4xl transition-transform duration-200 ease-out"
                        style={{ transformStyle: 'preserve-3d', cursor: 'none' }}
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Panel - Roles Display */}
                            {showRoles && (
                                <div 
                                    className="bg-gradient-to-br from-gray-800 to-black rounded-2xl border-2 border-red-900/50 shadow-2xl p-8 transition-all duration-300 hover:border-red-700/80 hover:shadow-red-900/20"
                                    style={{ cursor: 'none' }}
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-red-900/30 rounded-lg">
                                                <Skull className="w-6 h-6 text-red-400" />
                                            </div>
                                            <h2 className="text-xl font-bold text-white tracking-wider">
                                                SYSTEM AUTHORITY LEVELS
                                            </h2>
                                        </div>
                                        <button
                                            onClick={() => setShowRoles(false)}
                                            className="p-2 hover:bg-red-900/30 rounded-lg transition relative group"
                                            style={{ cursor: 'none' }}
                                        >
                                            <X className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
                                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-xs text-red-300 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                HIDE ROLES
                                            </span>
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {roles.map((role) => {
                                            const Icon = role.icon;
                                            return (
                                                <div 
                                                    key={role.id}
                                                    className={`bg-gradient-to-r ${role.color} rounded-xl p-4 border border-gray-700 hover:scale-105 hover:border-red-500/50 transition-all duration-300 cursor-default shadow-lg hover:shadow-red-900/30 relative overflow-hidden group`}
                                                    style={{ cursor: 'none' }}
                                                >
                                                    {/* Hover Glow */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                                    
                                                    <div className="flex items-center justify-between relative z-10">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-white/10 rounded-lg">
                                                                <Icon className="w-5 h-5 text-white" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-white tracking-wider">
                                                                    {role.name}
                                                                </h3>
                                                                <p className="text-xs text-gray-300">
                                                                    Access Level: {role.level}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xs text-gray-300 mb-1">PRIVILEGES</div>
                                                            <div className="text-white font-bold">
                                                                {role.id === 'superAdmin' ? 'FULL' : 
                                                                 role.id === 'accountVerifier' ? 'VERIFY' :
                                                                 role.id === 'cardManager' ? 'MANAGE' : 'PROCESS'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Access Warning */}
                                    <div className="mt-8 p-4 bg-black/50 border border-red-800/50 rounded-lg hover:border-red-600/50 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 animate-pulse" />
                                            <div>
                                                <h4 className="text-sm font-semibold text-red-300 mb-1">
                                                    SECURITY NOTICE
                                                </h4>
                                                <p className="text-xs text-gray-400">
                                                    All access attempts are logged and monitored. Unauthorized access will result in immediate account termination and legal action.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Right Panel - Login Form */}
                            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border-2 border-gray-700 shadow-2xl p-8 relative overflow-hidden hover:border-red-700/50 transition-all duration-300"
                                 style={{ cursor: 'none' }}>
                                {/* Glitch Effect Background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-red-900/5 via-transparent to-purple-900/5"></div>
                                
                                {/* Animated Scan Line */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan"></div>

                                <div className="relative z-10">
                                    {/* Header */}
                                    <div className="text-center mb-8">
                                        <div className="flex items-center justify-center gap-4 mb-4">
                                            <div className="p-3 bg-gradient-to-br from-red-600 to-red-800 rounded-full shadow-lg">
                                                <Shield className="w-8 h-8 text-white" />
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-gray-800 to-black border border-gray-700 rounded-full">
                                                <Lock className="w-8 h-8 text-red-400" />
                                            </div>
                                        </div>
                                        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent tracking-wider">
                                            ADMIN PORTAL
                                        </h1>
                                        <p className="text-gray-400 mt-2 font-mono text-sm tracking-wider">
                                            RESTRICTED ACCESS INTERFACE
                                        </p>
                                    </div>

                                    {/* Attempts Counter */}
                                    {loginAttempts > 0 && (
                                        <div className="mb-6 text-center">
                                            <span className="inline-block px-3 py-1 bg-red-900/30 text-red-300 rounded-full text-sm font-mono border border-red-700/50 animate-pulse">
                                                ATTEMPT #{loginAttempts}
                                            </span>
                                        </div>
                                    )}

                                    {/* Error Message */}
                                    {message.text && (
                                        <div className={`mb-6 p-4 rounded-xl border ${
                                            message.type === 'error' 
                                                ? 'bg-red-900/20 border-red-700/50 text-red-300' 
                                                : 'bg-green-900/20 border-green-700/50 text-green-300'
                                        }`}>
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm font-mono">{message.text}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Login Form */}
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2 tracking-wider">
                                                ACCESS IDENTIFIER
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Mail className="h-5 w-5 text-gray-500 group-hover:text-red-400 transition-colors" />
                                                </div>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="block w-full pl-12 pr-4 py-3 bg-black/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-500 transition-all duration-200 hover:border-red-600/50"
                                                    placeholder="admin@mybank.com"
                                                    required
                                                    disabled={loading}
                                                    style={{ cursor: 'none' }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2 tracking-wider">
                                                ENCRYPTION KEY
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Lock className="h-5 w-5 text-gray-500 group-hover:text-red-400 transition-colors" />
                                                </div>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className="block w-full pl-12 pr-12 py-3 bg-black/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-500 tracking-widest transition-all duration-200 hover:border-red-600/50"
                                                    placeholder="••••••••"
                                                    required
                                                    disabled={loading}
                                                    style={{ cursor: 'none' }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors hover:text-red-400"
                                                    style={{ cursor: 'none' }}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-3 px-4 rounded-lg font-bold tracking-wider hover:from-red-700 hover:to-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-red-900/50 relative overflow-hidden group"
                                            style={{ cursor: 'none' }}
                                        >
                                            <span className="relative z-10 flex items-center gap-2">
                                                {loading ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        VERIFYING ACCESS...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Key className="w-5 h-5" />
                                                        INITIATE LOGIN SEQUENCE
                                                    </>
                                                )}
                                            </span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                            
                                            {/* Danger Pulse Effect */}
                                            <div className="absolute inset-0 rounded-lg bg-red-600/20 animate-ping opacity-0 group-hover:opacity-100"></div>
                                        </button>
                                    </form>

                                    {/* Back to Home */}
                                    <div className="mt-8 pt-6 border-t border-gray-800">
                                        <Link 
                                            to="/"
                                            className="inline-flex items-center text-sm text-gray-400 hover:text-white font-mono tracking-wider group relative overflow-hidden"
                                            style={{ cursor: 'none' }}
                                        >
                                            <span className="relative overflow-hidden inline-block">
                                                <span className="inline-block transition-transform group-hover:-translate-x-full">
                                                    [ RETURN TO PUBLIC INTERFACE ]
                                                </span>
                                                <span className="absolute left-0 top-0 inline-block transition-transform group-hover:translate-x-0 translate-x-full text-red-400">
                                                    [ TERMINATE SESSION ]
                                                </span>
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Warning */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 border-t border-red-900 py-2 px-4 z-20">
                    <div className="text-center">
                        <p className="text-xs text-gray-400 font-mono flex items-center justify-center gap-4">
                            <span className="flex items-center gap-1">
                                <Radar className="w-3 h-3 text-green-400 animate-pulse" />
                                SYSTEM: <span className="text-green-400">ACTIVE</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <Lock className="w-3 h-3 text-blue-400" />
                                ENCRYPTION: <span className="text-blue-400">AES-256</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <Scan className="w-3 h-3 text-yellow-400 animate-pulse" />
                                LAST ACCESS: <span className="text-yellow-400">{new Date().toLocaleTimeString()}</span>
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Custom Animations */}
            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.1; }
                    50% { opacity: 0.3; }
                }
                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100vh); }
                }
                @keyframes scanHorizontal {
                    0% { transform: translateX(-100%); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateX(100vw); opacity: 0; }
                }
                .animate-scan {
                    animation: scan 2s linear infinite;
                }
                .animate-pulse {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                
                /* Hide cursor on all elements */
                * {
                    cursor: none !important;
                }
                
                /* Dangerous hover effects */
                button:hover, input:hover, a:hover {
                    position: relative;
                    z-index: 100;
                }
                
                /* Cursor trail styles */
                .cursor-trail {
                    pointer-events: none;
                    position: fixed;
                    border-radius: 50%;
                    mix-blend-mode: screen;
                    z-index: 9999;
                }
            `}</style>
        </>
    );
};

export default AdminLogin;