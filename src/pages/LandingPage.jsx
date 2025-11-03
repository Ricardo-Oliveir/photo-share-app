import { Link } from 'react-router-dom';
import React from 'react';
import {
    FiUpload,
    FiDownload,
    FiShield,
    FiClock,
    FiSmartphone,
    FiLink,
    FiUsers,
    FiPackage,
    FiChevronRight,
    FiExternalLink,
    FiMousePointer
} from 'react-icons/fi';
import { BsQrCode } from 'react-icons/bs';
import { FaCameraRetro } from 'react-icons/fa';
import { TbSparkles } from 'react-icons/tb';

// ----- COMPONENTE PRINCIPAL DA PÁGINA -----
export default function LandingPage() {
    return (
        <div className="bg-white text-gray-700 font-sans">
            <HeroSection />
            <HowItWorksSection />
            <FeaturesSection />
            <CTASection />
            <Footer />
        </div>
    );
}

// ----- 1. SEÇÃO HERO (IMAGEM 1) -----
function HeroSection() {
    return (
        
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-pattern bg-cover bg-center">
            {/* Overlay claro para garantir a legibilidade do texto */}
            <div className="absolute inset-0 bg-white opacity-80" />

            <div className="relative z-10 text-center p-6 max-w-3xl mx-auto">
                <div className="inline-flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
                    <BsQrCode className="mr-2" /> Compartilhamento Simples de Fotos
                </div>

                <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900">
                    Capture Momentos, <br />
                    <span className="text-blue-600">
                        Compartilhe Memórias
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto mb-10">
                    A maneira mais fácil de coletar e compartilhar fotos de eventos. Um QR Code, upload instantâneo, download temporário.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                    <a
                        href="/login"
                        className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                        Começar Agora <FiChevronRight className="ml-2" />
                    </a>
                    <a
                        href="#how-it-works"
                        className="flex items-center justify-center bg-white text-gray-700 font-semibold py-3 px-8 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-all duration-300"
                    >
                        Como Funciona
                    </a>
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto text-gray-700">
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-blue-600">15</h3>
                        <p className="text-sm">Dias de Acesso</p>
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-blue-600">QR Code</h3>
                        <p className="text-sm">Acesso Rápido</p>
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-blue-600">100%</h3>
                        <p className="text-sm">Seguro</p>
                    </div>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500 animate-bounce">
                    <FiMousePointer size={24} />
                </div>
            </div>
        </div>
    );
}

// ----- 2. SEÇÃO COMO FUNCIONA (IMAGEM 2) -----
function HowItWorksSection() {
    const cardIconColor = "text-blue-600";
    const cardIconBg = "bg-blue-100";

    return (
        <section id="how-it-works" className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-6 text-center">
                <h2 className="text-4xl font-bold mb-4 text-gray-900">Como Funciona</h2>
                <p className="text-lg text-gray-600 mb-12">
                    Três passos simples para compartilhar todas as fotos do seu evento
                </p>
                <div className="grid md:grid-cols-3 gap-8">
                    <HowItWorksCard
                        step="1"
                        icon={<BsQrCode size={32} className={cardIconColor} />}
                        title="Escaneie o QR Code"
                        description="Acesse o evento através do QR Code único. *Sem cadastro*, apenas um nome opcional para identificar suas fotos."
                        iconBg={cardIconBg}
                    />
                    <HowItWorksCard
                        step="2"
                        icon={<FiUpload size={32} className={cardIconColor} />}
                        title="Faça Upload das Fotos"
                        description="Envie suas fotos diretamente do celular. Interface simples e rápida, sem complicações."
                        iconBg={cardIconBg}
                    />
                    <HowItWorksCard
                        step="3"
                        icon={<FiDownload size={32} className={cardIconColor} />}
                        title="Baixe e Compartilhe"
                        description="O admin recebe um link temporário para baixar todas as fotos. Válido por 15 dias."
                        iconBg={cardIconBg}
                    />
                </div>
            </div>
        </section>
    );
}

// Componente Card (usado na seção 2)
function HowItWorksCard({ step, icon, title, description, iconBg }) {
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-left relative">
            <div className="absolute -top-4 -left-4 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                {step}
            </div>
            <div className={`p-3 ${iconBg} rounded-lg inline-block mb-4`}>
                {icon}
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-900">{title}</h3>
            <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: description.replace("*Sem cadastro*", "<b>Sem cadastro</b>") }} />
        </div>
    );
}

// ----- 3. SEÇÃO FEATURES (IMAGEM 3) -----
function FeaturesSection() {
    const featureIconColor = "text-blue-600";
    const featureIconBg = "bg-blue-100";

    return (
        <section id="features" className="py-20 bg-gray-50">
            <div className="max-w-6xl mx-auto px-6 text-center">
                <h2 className="text-4xl font-bold mb-4 text-gray-900">Por Que Escolher Nossa Plataforma</h2>
                <p className="text-lg text-gray-600 mb-12">
                    Recursos pensados para tornar o compartilhamento de fotos simples e seguro
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                    <FeatureCard
                        icon={<FiShield size={24} className={featureIconColor} />}
                        title="100% Seguro"
                        description="Armazenamento em nuvem com criptografia. Suas fotos estão protegidas."
                        iconBg={featureIconBg}
                    />
                    <FeatureCard
                        icon={<FiClock size={24} className={featureIconColor} />}
                        title="Acesso Temporário"
                        description="Links expiram automaticamente após 15 dias, garantindo privacidade."
                        iconBg={featureIconBg}
                    />
                    <FeatureCard
                        icon={<FiSmartphone size={24} className={featureIconColor} />}
                        title="Mobile First"
                        description="Otimizado para celular. Upload rápido direto do smartphone."
                        iconBg={featureIconBg}
                    />
                    <FeatureCard
                        icon={<FiLink size={24} className={featureIconColor} />}
                        title="Compartilhamento Fácil"
                        description="Um link único para cada evento. Compartilhe com todos os participantes."
                        iconBg={featureIconBg}
                    />
                    <FeatureCard
                        icon={<FiUsers size={24} className={featureIconColor} />}
                        title="Múltiplos Usuários"
                        description="Vários participantes podem enviar fotos para o mesmo evento."
                        iconBg={featureIconBg}
                    />
                    <FeatureCard
                        icon={<FiPackage size={24} className={featureIconColor} />}
                        title="Sem Limite de Espaço"
                        description="Envie quantas fotos quiser. Não há limite de armazenamento (configurável)."
                        iconBg={featureIconBg}
                    />
                </div>
            </div>
        </section>
    );
}

// Componente Card (usado na seção 3)
function FeatureCard({ icon, title, description, iconBg }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-left">
            <div className={`p-3 ${iconBg} rounded-lg inline-block mb-4`}>
                {icon}
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
            <p className="text-gray-600 text-sm">{description}</p>
        </div>
    );
}

// ----- 4. SEÇÃO CTA FINAL (IMAGEM 4) -----
function CTASection() {
    return (
        <section id="cta" className="py-24 bg-gradient-to-b from-white to-blue-50">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <div className="inline-block p-4 bg-blue-600 rounded-2xl shadow-lg mb-6">
                    <TbSparkles size={40} className="text-white" />
                </div>
                <h2 className="text-5xl font-bold mb-6 text-gray-900">Pronto para Começar?</h2>
                <p className="text-lg text-gray-600 mb-10">
                    Crie seu primeiro evento agora e simplifique o compartilhamento de fotos.
                    <br />
                    Sem complicações, sem instalações, apenas momentos inesquecíveis.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="#admin-login"
                        className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                        Criar Meu Evento <FiChevronRight className="ml-2" />
                    </a>
                    <a
                        href="#support"
                        className="flex items-center justify-center bg-white text-gray-700 font-semibold py-3 px-8 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-all duration-300"
                    >
                        Falar com Suporte <FiExternalLink className="ml-2" />
                    </a>
                </div>
                <div className="mt-10 text-sm text-gray-500 flex items-center justify-center gap-4">
                    <span>📦 Armazenamento seguro</span>
                    <span>•</span>
                    <span>⚡ Upload rápido</span>
                    <span>•</span>
                    <span>🐵 Sem complicações</span>
                </div>
            </div>
        </section>
    );
}

// ----- 5. RODAPÉ (IMAGEM 4) -----
function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo e Descrição */}
                    <div>
                        <div className="flex items-center mb-2">
                            <div className="p-2 bg-blue-600 rounded-lg mr-2">
                                <FaCameraRetro className="text-white" />
                            </div>
                            <span className="font-bold text-xl text-gray-900">PhotoShare</span>
                        </div>
                        <p className="text-gray-500 text-sm">
                            Compartilhe momentos, crie memórias.
                        </p>
                    </div>

                    {/* Links de Produto */}
                    <div>
                        <h4 className="font-semibold mb-3 text-gray-800">Produto</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><a href="#how-it-works" className="hover:text-blue-600">Como Funciona</a></li>
                            <li><a href="#features" className="hover:text-blue-600">Recursos</a></li>
                            <li><a href="#pricing" className="hover:text-blue-600">Preços</a></li>
                        </ul>
                    </div>

                    {/* Links de Suporte */}
                    <div>
                        <h4 className="font-semibold mb-3 text-gray-800">Suporte</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><a href="#faq" className="hover:text-blue-600">FAQ</a></li>
                            <li><a href="#contact" className="hover:text-blue-600">Contato</a></li>
                            <li><a href="#docs" className="hover:text-blue-600">Documentação</a></li>
                        </ul>
                    </div>

                    {/* Links Legais */}
                    <div>
                        <h4 className="font-semibold mb-3 text-gray-800">Legal</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><a href="#privacy" className="hover:text-blue-600">Privacidade</a></li>
                            <li><a href="#terms" className="hover:text-blue-600">Termos de Uso</a></li>
                            <li><a href="#cookies" className="hover:text-blue-600">Cookies</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                    © 2025 PhotoShare. Todos os direitos reservados.
                </div>
            </div>
        </footer>
    );
}