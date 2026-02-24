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
    FiMousePointer,
    FiCheck
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
            <PricingSection /> {/* Nova seção de preços integrada */}
            <CTASection />
            <Footer />
        </div>
    );
}

// ----- 1. SEÇÃO HERO -----
function HeroSection() {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-pattern bg-cover bg-center">
            <div className="absolute inset-0 bg-white opacity-80" />

            <div className="relative z-10 text-center p-6 max-w-3xl mx-auto">
                <div className="inline-flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
                    <BsQrCode className="mr-2" /> Compartilhamento Simples de Fotos
                </div>

                <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900">
                    Capture Momentos, <br />
                    <span className="text-blue-600">Compartilhe Memórias</span>
                </h1>

                <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto mb-10">
                    A maneira mais fácil de coletar e compartilhar fotos de eventos. Um QR Code, upload instantâneo, download garantido por um mês.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                    <Link
                        to="/login"
                        className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                        Começar Agora <FiChevronRight className="ml-2" />
                    </Link>
                    <a
                        href="#how-it-works"
                        className="flex items-center justify-center bg-white text-gray-700 font-semibold py-3 px-8 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-all duration-300"
                    >
                        Como Funciona
                    </a>
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto text-gray-700">
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-blue-600">30</h3>
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

// ----- 2. SEÇÃO COMO FUNCIONA -----
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
                        description="O admin gerencia a galeria em tempo real e baixa todas as fotos. Válido por 30 dias."
                        iconBg={cardIconBg}
                    />
                </div>
            </div>
        </section>
    );
}

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

// ----- 3. SEÇÃO FEATURES -----
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
                    <FeatureCard icon={<FiShield size={24} className={featureIconColor} />} title="100% Seguro" description="Armazenamento em nuvem seguro para proteger suas memórias." iconBg={featureIconBg} />
                    <FeatureCard icon={<FiClock size={24} className={featureIconColor} />} title="Acesso por 30 Dias" description="Links e galerias expiram automaticamente após 30 dias." iconBg={featureIconBg} />
                    <FeatureCard icon={<FiSmartphone size={24} className={featureIconColor} />} title="Mobile First" description="Otimizado para smartphones. Upload rápido direto do navegador." iconBg={featureIconBg} />
                    <FeatureCard icon={<FiLink size={24} className={featureIconColor} />} title="Compartilhamento Fácil" description="Um link único ou QR Code para cada evento ativo." iconBg={featureIconBg} />
                    <FeatureCard icon={<FiUsers size={24} className={featureIconColor} />} title="Múltiplos Usuários" description="Todos os participantes podem enviar fotos simultaneamente." iconBg={featureIconBg} />
                    <FeatureCard icon={<FiPackage size={24} className={featureIconColor} />} title="Planos Flexíveis" description="Escolha entre 300, 1000 ou fotos ilimitadas conforme seu evento." iconBg={featureIconBg} />
                </div>
            </div>
        </section>
    );
}

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

// ----- NOVA SEÇÃO: PREÇOS -----
function PricingSection() {
    const planos = [
        { nome: 'Básico', preco: '49,90', fotos: '300 fotos', destaque: false },
        { nome: 'Padrão', preco: '149,90', fotos: '1.000 fotos', destaque: true },
        { nome: 'Premium', preco: '499,90', fotos: 'Ilimitado', destaque: false }
    ];

    return (
        <section id="pricing" className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-6 text-center">
                <h2 className="text-4xl font-bold mb-12 text-gray-900">Escolha seu Plano</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {planos.map((p, i) => (
                        <div key={i} className={`p-8 rounded-2xl border ${p.destaque ? 'border-blue-600 shadow-2xl scale-105' : 'border-gray-100 shadow-lg'} flex flex-col`}>
                            <h3 className="text-xs font-black uppercase text-blue-600 mb-4">{p.nome}</h3>
                            <div className="text-4xl font-black text-gray-900 mb-6">R$ {p.preco}</div>
                            <ul className="text-left space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-2 text-sm"><FiCheck className="text-green-500" /> {p.fotos}</li>
                                <li className="flex items-center gap-2 text-sm"><FiCheck className="text-green-500" /> 30 dias de galeria</li>
                                <li className="flex items-center gap-2 text-sm"><FiCheck className="text-green-500" /> Download individual e em massa</li>
                            </ul>
                            <Link to="/cadastro" className={`w-full py-3 rounded-xl font-bold transition-all ${p.destaque ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
                                Começar Evento
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ----- 4. SEÇÃO CTA FINAL -----
function CTASection() {
    return (
        <section id="cta" className="py-24 bg-gradient-to-b from-white to-blue-50">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <div className="inline-block p-4 bg-blue-600 rounded-2xl shadow-lg mb-6">
                    <TbSparkles size={40} className="text-white" />
                </div>
                <h2 className="text-5xl font-bold mb-6 text-gray-900">Pronto para Começar?</h2>
                <p className="text-lg text-gray-600 mb-10">
                    Crie seu primeiro evento agora e simplifique o compartilhamento de fotos. <br />
                    Sem complicações, sem instalações, apenas momentos inesquecíveis.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/cadastro"
                        className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                        Criar Meu Evento <FiChevronRight className="ml-2" />
                    </Link>
                    <Link
                        to="/login"
                        className="flex items-center justify-center bg-white text-gray-700 font-semibold py-3 px-8 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-all duration-300"
                    >
                        Falar com Suporte <FiExternalLink className="ml-2" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

// ----- 5. RODAPÉ -----
function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="max-w-6xl mx-auto px-6 py-12 text-center">
                <div className="flex items-center justify-center mb-6">
                    <div className="p-2 bg-blue-600 rounded-lg mr-2">
                        <FaCameraRetro className="text-white" />
                    </div>
                    <span className="font-bold text-xl text-gray-900">PhotoShare</span>
                </div>
                <p className="text-gray-500 text-sm mb-6">Compartilhe momentos, crie memórias.</p>
                <div className="pt-8 border-t border-gray-200 text-sm text-gray-500 font-bold uppercase tracking-widest">
                    © 2026 PhotoShare. Todos os direitos reservados.
                </div>
            </div>
        </footer>
    );
}