// Strategic Matrix Data - Unicórnios LATAM e Configurações
const MatrixData = {
    // Dimensões estratégicas
    dimensions: {
        tech: {
            name: 'Tech & Automação',
            description: 'Grau de automação e tecnologia',
            color: '#fc8d56',
            icon: '🤖',
            weight: 0.25
        },
        platform: {
            name: 'Marketplace',
            description: 'Marketplace vs. Serviço tradicional',
            color: '#a78bfa',
            icon: '👫',
            weight: 0.20
        },
        recurring: {
            name: 'Recorrência',
            description: 'Receita recorrente vs. Transacional',
            color: '#22c55e',
            icon: '🔄',
            weight: 0.25
        },
        scale: {
            name: 'Capilaridade',
            description: 'Capacidade de expansão geográfica',
            color: '#f59e0b',
            icon: '🌎',
            weight: 0.15
        },
        b2bFocus: {
            name: 'B2C ↔ B2B',
            description: 'Enterprise (100) vs. Consumer (0)',
            color: '#ef4444',
            icon: '🏢',
            weight: 0.15
        }
    },

    // Dados dos Unicórnios LATAM
    unicorns: {
        nubank: {
            name: 'Nubank',
            category: 'Fintech',
            valuation: 45000, // milhões USD
            color: '#8B5CF6',
            coordinates: {
                tech: 92,
                platform: 88,
                recurring: 95,
                scale: 98,
                b2bFocus: 5
            },
            metrics: {
                growth: 65,
                margin: 42,
                retention: 94,
                nps: 87,
                employees: 7000,
                countries: 3
            },
            strategy: 'Digital bank com foco B2C, alta tecnologia e expansão regional'
        },
        mercadolibre: {
            name: 'MercadoLibre',
            category: 'E-commerce',
            valuation: 80000,
            color: '#FFC107',
            coordinates: {
                tech: 78,
                platform: 95,
                recurring: 35,
                scale: 95,
                b2bFocus: 30
            },
            metrics: {
                growth: 55,
                margin: 28,
                retention: 78,
                nps: 76,
                employees: 35000,
                countries: 18
            },
            strategy: 'Marketplace + fintech com presença pan-regional'
        },
        rappi: {
            name: 'Rappi',
            category: 'Super App',
            valuation: 5500,
            color: '#FF6B6B',
            coordinates: {
                tech: 73,
                platform: 82,
                recurring: 40,
                scale: 85,
                b2bFocus: 15
            },
            metrics: {
                growth: 45,
                margin: -5,
                retention: 65,
                nps: 68,
                employees: 5000,
                countries: 9
            },
            strategy: 'Super app de delivery e serviços on-demand'
        },
        dlocal: {
            name: 'dLocal',
            category: 'Payments',
            valuation: 12000,
            color: '#00BCD4',
            coordinates: {
                tech: 88,
                platform: 75,
                recurring: 65,
                scale: 80,
                b2bFocus: 95
            },
            metrics: {
                growth: 75,
                margin: 55,
                retention: 92,
                nps: 82,
                employees: 900,
                countries: 40
            },
            strategy: 'Pagamentos cross-border para empresas globais'
        },
        wildlife: {
            name: 'Wildlife Studios',
            category: 'Gaming',
            valuation: 3000,
            color: '#E91E63',
            coordinates: {
                tech: 95,
                platform: 60,
                recurring: 70,
                scale: 90,
                b2bFocus: 0
            },
            metrics: {
                growth: 85,
                margin: 65,
                retention: 45,
                nps: 72,
                employees: 850,
                countries: 'Global'
            },
            strategy: 'Mobile gaming com monetização via IAP'
        },
        quintoandar: {
            name: 'QuintoAndar',
            category: 'PropTech',
            valuation: 5200,
            color: '#4CAF50',
            coordinates: {
                tech: 68,
                platform: 85,
                recurring: 55,
                scale: 75,
                b2bFocus: 20
            },
            metrics: {
                growth: 50,
                margin: 22,
                retention: 70,
                nps: 78,
                employees: 2500,
                countries: 2
            },
            strategy: 'Marketplace imobiliário com garantias integradas'
        },
        kavak: {
            name: 'Kavak',
            category: 'AutoTech',
            valuation: 8700,
            color: '#FF9800',
            coordinates: {
                tech: 62,
                platform: 88,
                recurring: 25,
                scale: 80,
                b2bFocus: 15
            },
            metrics: {
                growth: 70,
                margin: 18,
                retention: 60,
                nps: 71,
                employees: 4500,
                countries: 10
            },
            strategy: 'Marketplace de carros usados com financiamento'
        },
        loggi: {
            name: 'Loggi',
            category: 'Logistics',
            valuation: 2200,
            color: '#00baff',
            coordinates: {
                tech: 65,
                platform: 70,
                recurring: 45,
                scale: 85,
                b2bFocus: 75
            },
            metrics: {
                growth: 40,
                margin: 8,
                retention: 75,
                nps: 69,
                employees: 2000,
                countries: 1
            },
            strategy: 'Logística urbana com tecnologia própria'
        },
        gympass: {
            name: 'Gympass',
            category: 'Wellness',
            valuation: 2400,
            color: '#9C27B0',
            coordinates: {
                tech: 70,
                platform: 90,
                recurring: 85,
                scale: 78,
                b2bFocus: 80
            },
            metrics: {
                growth: 60,
                margin: 25,
                retention: 88,
                nps: 80,
                employees: 1200,
                countries: 14
            },
            strategy: 'Plataforma B2B2C de bem-estar corporativo'
        },
        vtex: {
            name: 'VTEX',
            category: 'E-commerce SaaS',
            valuation: 4100,
            color: '#FF5722',
            coordinates: {
                tech: 85,
                platform: 92,
                recurring: 90,
                scale: 82,
                b2bFocus: 100
            },
            metrics: {
                growth: 48,
                margin: 35,
                retention: 95,
                nps: 84,
                employees: 1800,
                countries: 45
            },
            strategy: 'Plataforma SaaS para e-commerce enterprise'
        }
    },

    // Configurações de visualização
    visualization: {
        sphereSize: {
            min: 0.3,
            max: 0.8,
            valuationScale: 0.00001 // escala para converter valuation em tamanho
        },
        colors: {
            soller: '#ffffffff',
            grid: 'rgba(255,255,255,0.1)',
            axes: 'rgba(255,255,255,0.3)',
            connection: 'rgba(167,139,250,0.2)',
            highlight: '#fbbf24',
            optimal: '#22c55e'
        },
        animation: {
            duration: 1500,
            easing: 'easeInOutCubic'
        }
    },

    // Benchmarks e métricas alvo
    benchmarks: {
        unicornThreshold: 1000, // milhões USD
        growthRate: {
            minimum: 40,
            target: 80,
            exceptional: 120
        },
        margins: {
            service: 15,
            hybrid: 25,
            saas: 35,
            marketplace: 20
        },
        retention: {
            poor: 70,
            good: 85,
            excellent: 95
        }
    },

    // Mapeamento de toggles para dimensões
    toggleMapping: {
        crmImplementation: {
            tech: 5,
            platform: 2,
            scale: 3
        },
        salesAutomation: {
            tech: 8,
            recurring: 3,
            scale: 5
        },
        customerSuccessTeam: {
            recurring: 10,
            b2bFocus: 5
        },
        marketplaceBeta: {
            platform: 15,
            tech: 5,
            scale: 8
        },
        selfServicePlatform: {
            tech: 10,
            platform: 8,
            recurring: 5
        },
        mobileApp: {
            tech: 7,
            scale: 10,
            b2bFocus: -5
        },
        microinfluencersProgram: {
            scale: 12,
            platform: 5,
            b2bFocus: -8
        },
        marketplaceFull: {
            platform: 25,
            tech: 10,
            recurring: 8,
            scale: 15
        },
        saasRevenue: {
            recurring: 30,
            tech: 12,
            b2bFocus: 10
        },
        internationalExpansion: {
            scale: 35,
            tech: 5,
            platform: 8
        }
    }
};