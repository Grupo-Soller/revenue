class SollerProjections {
    constructor() {
        this.currentState = {
            gmvMensal: 2800000,
            valorSollerMensal: 608000,
            margem: 21.7,
            contratosMes: 156,
            ticketMedio: 17950,
            churnRate: 70.9,
            equipe: 15,
            influenciadores: 134
        };

        this.parameters = {
            churnRate: 70.9,
            ticketMedio: 17950,
            contratosMes: 156,
            margem: 21.7,
            equipeVendas: 15,
            crmImplementation: false,
            salesAutomation: false,
            customerSuccessTeam: false,
            marketplaceBeta: false,
            selfServicePlatform: false,
            mobileApp: false,
            microinfluencersProgram: false,
            techInvestment: 0,
            marketplaceFull: false,
            saasRevenue: false,
            internationalExpansion: false,
            brandInvestment: 0,
            scenarioType: 'realista',
            projectionMonths: 24
        };

        this.scenarioMultipliers = {
            'pessimista': 0.5,
            'realista': 1.0,
            'conservador': 1.0,
            'otimista': 2.0
        };

        this.limits = {
            maxMargin: 30,
            targetMargin: 28,
            minChurn: 20
        };

        this.projectionCache = null;
    }

    calculateProjections() {
        const months = this.parameters.projectionMonths;
        const projections = {
            months: [],
            gmv: [],
            valorSoller: [],
            margin: [],
            contracts: [],
            churn: [],
            team: [],
            workingCapital: [],
            valuation: [],
            ltv: [],
            cac: [],
            rule40: [],
            revPerEmployee: [],
            influenciadores: [],
            alerts: [],
            contributionByInitiative: this.initializeContributions(months),
            metrics: {}
        };

        let state = { ...this.currentState };
        const impacts = this.calculateGatilhoImpacts();
        
        for (let month = 1; month <= months; month++) {
            const monthData = this.calculateMonthProjection(state, month, impacts);
            
            projections.months.push(this.getMonthLabel(month));
            projections.gmv.push(monthData.gmv);
            projections.valorSoller.push(monthData.valorSoller);
            projections.margin.push(monthData.margin);
            projections.contracts.push(monthData.contracts);
            projections.churn.push(monthData.churn);
            projections.team.push(monthData.team);
            projections.workingCapital.push(monthData.workingCapital);
            projections.valuation.push(monthData.valuation);
            projections.influenciadores.push(monthData.influenciadores);
            
            projections.ltv.push(this.calculateLTV(monthData));
            projections.cac.push(this.calculateCAC(monthData));
            projections.rule40.push(this.calculateRule40(monthData, state));
            projections.revPerEmployee.push(monthData.valorSoller / monthData.team);
            
            this.updateContributions(projections.contributionByInitiative, month, monthData, impacts);
            this.validateProjection(monthData, month, projections.alerts);
            
            state = monthData;
        }

        projections.metrics = this.calculateAggregateMetrics(projections);
        this.projectionCache = projections;
        return projections;
    }

    initializeContributions(months) {
        const contributions = {
            baseline: new Array(months).fill(0),
            techStack: new Array(months).fill(0),
            customerSuccess: new Array(months).fill(0),
            marketplace: new Array(months).fill(0),
            microinfluencers: new Array(months).fill(0),
            international: new Array(months).fill(0)
        };
        return contributions;
    }

    calculateMonthlyGrowthRate(month) {
        const scenarioMultiplier = this.scenarioMultipliers[this.parameters.scenarioType] || 1.0;
        const progressionRate = month / 24;
        const baseGrowthStart = 0.029;
        const baseGrowthEnd = 0.037;
        const baseGrowth = baseGrowthStart + (baseGrowthEnd - baseGrowthStart) * progressionRate;
        return baseGrowth * scenarioMultiplier;
    }

    calculateMarginProgression(month) {
        const baseMargin = this.parameters.margem;
        const targetMargin = this.limits.targetMargin;
        const scenarioMultiplier = this.scenarioMultipliers[this.parameters.scenarioType] || 1.0;
        const progressionRate = month / 24;
        const marginIncrease = (targetMargin - baseMargin) * progressionRate * scenarioMultiplier;
        return Math.min(this.limits.maxMargin, baseMargin + marginIncrease);
    }

    calculateGatilhoImpacts() {
    const scenarioMultiplier = this.scenarioMultipliers[this.parameters.scenarioType] || 1.0;
    
    const impacts = {
        efficiency: 1.0,
        conversion: 1.0,
        churnReduction: 0,
        marginIncrease: 0,
        influencerGrowth: 1.0,
        tamExpansion: 1.0,
        recurringRevenue: 0
    };

    // CRM & Marketing (sempre ativo no pessimista)
    if (this.parameters.crmImplementation) {
        impacts.efficiency *= 1.10;
        impacts.conversion *= 1.08;
    }
    
    // Automação 360 (sempre ativo no pessimista)
    if (this.parameters.salesAutomation) {
        impacts.conversion *= 1.15;
        impacts.marginIncrease += 1; // automação aumenta margem
    }
    
    // Customer Success Team
    if (this.parameters.customerSuccessTeam) {
        impacts.churnReduction = 20;
        impacts.conversion *= 1.05; // upsell
    }
    
    // Marketplace Beta
    if (this.parameters.marketplaceBeta) {
        impacts.influencerGrowth *= 1.25;
        impacts.tamExpansion *= 1.15;
    }
    
    // Self-Service Platform
    if (this.parameters.selfServicePlatform) {
        impacts.marginIncrease += 2;
        impacts.efficiency *= 1.20;
    }
    
    // Mobile App
    if (this.parameters.mobileApp) {
        impacts.conversion *= 1.08;
        impacts.churnReduction += 5;
    }
    
    // Microinfluencers Program
    if (this.parameters.microinfluencersProgram) {
        impacts.influencerGrowth *= 1.10;
        impacts.tamExpansion *= 1.05;
    }
    
    // Full Marketplace
    if (this.parameters.marketplaceFull) {
        impacts.influencerGrowth *= 1.40;
        impacts.tamExpansion *= 1.30;
        impacts.marginIncrease += 2;
    }
    
    // SaaS Revenue
    if (this.parameters.saasRevenue) {
        impacts.recurringRevenue = 150;
        impacts.churnReduction += 10;
    }
    
    // International Expansion
    if (this.parameters.internationalExpansion) {
        impacts.tamExpansion *= 1.40;
    }
    
    // INVESTIMENTOS PROPORCIONAIS
    // Tech Investment (0 a R$5M)
    if (this.parameters.techInvestment > 0) {
        const techBoost = Math.min(this.parameters.techInvestment / 3000000, 1); // máximo em R$3M
        impacts.efficiency *= (1 + techBoost * 0.15);
        impacts.marginIncrease += techBoost * 2;
    }
    
    // Brand Investment (0 a R$10M)  
    if (this.parameters.brandInvestment > 0) {
        const brandBoost = Math.min(this.parameters.brandInvestment / 2000000, 1); // máximo em R$2M
        impacts.conversion *= (1 + brandBoost * 0.20);
        impacts.influencerGrowth *= (1 + brandBoost * 0.10);
    }
    
    // Aplicar multiplicador do cenário
    Object.keys(impacts).forEach(key => {
        if (key !== 'churnReduction' && key !== 'marginIncrease' && key !== 'recurringRevenue') {
            impacts[key] = 1 + ((impacts[key] - 1) * scenarioMultiplier);
        } else {
            impacts[key] = impacts[key] * scenarioMultiplier;
        }
    });
    
    return impacts;
}

    calculateMonthProjection(previousState, month, impacts) {
    const projection = { ...previousState };
    const monthlyGrowthRate = this.calculateMonthlyGrowthRate(month);
    const compoundedGrowth = Math.pow(1 + monthlyGrowthRate, month);
    
    // CHURN - mantém lógica original
    if (impacts.churnReduction > 0) {
        const targetChurn = Math.max(this.limits.minChurn, this.parameters.churnRate - impacts.churnReduction);
        const adoptionRate = Math.min(1, month / 6);
        projection.churn = this.parameters.churnRate - (this.parameters.churnRate - targetChurn) * adoptionRate;
    } else {
        projection.churn = this.parameters.churnRate;
    }
    
    const retentionRate = 1 - (projection.churn / 100);
    
    // CONTRATOS - baseado em parâmetros + impacts
    const baseContracts = this.parameters.contratosMes * impacts.conversion;
    const capacityLimit = this.parameters.equipeVendas * 10 * (1 + month/24); // crescimento gradual
    const newContracts = Math.min(baseContracts * compoundedGrowth, capacityLimit);
    const effectiveContracts = newContracts * Math.pow(retentionRate, Math.min(month / 3, 4));
    
    // TICKET MÉDIO - com crescimento gradual
    const ticketGrowth = 1 + (month / 24) * 0.2; // até 20% em 24 meses
    projection.ticketMedio = this.parameters.ticketMedio * ticketGrowth;
    
    // GMV CALCULADO - faturamento total
    projection.gmv = this.currentState.gmvMensal * compoundedGrowth * impacts.efficiency * impacts.tamExpansion;
    
    // MARGEM - progressão + impactos
    projection.margin = this.calculateMarginProgression(month) + impacts.marginIncrease;
    projection.margin = Math.min(this.limits.maxMargin, projection.margin);
    
    // VALOR SOLLER - lucro bruto (GMV * margem)
    projection.valorSoller = projection.gmv * (projection.margin / 100);
    
    // RECEITA RECORRENTE SaaS adicional
    if (impacts.recurringRevenue > 0 && month >= 12) {
        const adoptionRate = Math.min(1, (month - 12) / 12);
        const influencerBase = 134 * Math.pow(impacts.influencerGrowth, month / 24);
        const saasRevenue = influencerBase * impacts.recurringRevenue * adoptionRate;
        projection.valorSoller += saasRevenue;
        // Ajusta GMV proporcionalmente (receita SaaS tem margem ~90%)
        projection.gmv += saasRevenue / 0.9;
    }
    
    // EQUIPE - crescimento controlado
    const teamGrowthRate = Math.sqrt(compoundedGrowth); // crescimento mais lento
    projection.team = Math.ceil(this.parameters.equipeVendas * teamGrowthRate);
    
    // WORKING CAPITAL - 18% do GMV
    projection.workingCapital = projection.gmv * 0.18;
    
    // VALUATION
    projection.valuation = this.calculateValuation(projection, month, impacts);
    
    // VALORES FINAIS
    projection.contracts = Math.round(effectiveContracts);
    projection.influenciadores = Math.round(134 * Math.pow(impacts.influencerGrowth, month / 24));
    
    return projection;
}

    calculateValuation(projection, month, impacts) {
        const annualizedRevenue = projection.valorSoller * 12;
        const growthRate = this.calculateMonthlyGrowthRate(month);
        const baseMultiple = 1.5 + growthRate * 10;
        
        let agencyWeight = 1.0;
        let marketplaceWeight = 0;
        let saasWeight = 0;
        
        if (this.parameters.marketplaceBeta || this.parameters.marketplaceFull) {
            const adoptionRate = Math.min(1, Math.max(0, (month - 6) / 18));
            marketplaceWeight = Math.min(0.4, adoptionRate * 0.4);
            agencyWeight -= marketplaceWeight;
        }
        
        if (this.parameters.saasRevenue && month >= 12) {
            const adoptionRate = Math.min(1, (month - 12) / 12);
            saasWeight = Math.min(0.3, adoptionRate * 0.3);
            agencyWeight -= saasWeight;
        }
        
        const agencyMultiple = baseMultiple;
        const marketplaceMultiple = baseMultiple * 1.8;
        const saasMultiple = baseMultiple * 2.5;
        
        let valuation = annualizedRevenue * (
            agencyWeight * agencyMultiple +
            marketplaceWeight * marketplaceMultiple +
            saasWeight * saasMultiple
        );
        
        if (this.parameters.internationalExpansion && month >= 18) {
            const intlAdoption = Math.min(1, (month - 18) / 6);
            valuation *= 1 + (0.25 * intlAdoption);
        }
        
        return Math.min(valuation, 2000000000);
    }

    updateContributions(contributions, month, monthData, impacts) {
    const monthIndex = month - 1;
    const baseContribution = this.currentState.valorSollerMensal;
    const growthRate = this.calculateMonthlyGrowthRate(month);
    const compoundedGrowth = Math.pow(1 + growthRate, month);
    
    // BASELINE - crescimento natural
    contributions.baseline[monthIndex] = baseContribution * compoundedGrowth;
    
    // TECH STACK (CRM + Automação + Self-Service + Mobile)
    let techStackContribution = 0;
    if (this.parameters.crmImplementation || this.parameters.salesAutomation) {
        const crmImpact = this.parameters.crmImplementation ? 0.10 : 0;
        const salesImpact = this.parameters.salesAutomation ? 0.15 : 0;
        techStackContribution = baseContribution * (crmImpact + salesImpact) * compoundedGrowth;
    }
    
    if (this.parameters.selfServicePlatform && month >= 9) {
        const adoptionRate = Math.min(1, (month - 9) / 9);
        techStackContribution += baseContribution * 0.08 * adoptionRate * compoundedGrowth;
    }
    
    if (this.parameters.mobileApp && month >= 12) {
        const adoptionRate = Math.min(1, (month - 12) / 6);
        techStackContribution += baseContribution * 0.05 * adoptionRate * compoundedGrowth;
    }
    contributions.techStack[monthIndex] = techStackContribution;
    
    // CUSTOMER SUCCESS
    if (this.parameters.customerSuccessTeam) {
        const adoptionRate = Math.min(1, month / 4);
        contributions.customerSuccess[monthIndex] = baseContribution * 0.20 * adoptionRate * compoundedGrowth;
    } else {
        contributions.customerSuccess[monthIndex] = 0;
    }
    
    // MARKETPLACE (Beta + Full + SaaS)
    let marketplaceTotal = 0;
    if (this.parameters.marketplaceBeta && month >= 6) {
        const adoptionRate = Math.min(1, (month - 6) / 12);
        marketplaceTotal += baseContribution * 0.15 * adoptionRate * compoundedGrowth;
    }
    
    if (this.parameters.marketplaceFull && month >= 18) {
        const adoptionRate = Math.min(1, (month - 18) / 6);
        marketplaceTotal += baseContribution * 0.25 * adoptionRate * compoundedGrowth;
    }
    
    if (this.parameters.saasRevenue && month >= 12) {
        const adoptionRate = Math.min(1, (month - 12) / 12);
        const influencerBase = 134 * (1 + adoptionRate * 0.5);
        marketplaceTotal += influencerBase * 150 * adoptionRate;
    }
    contributions.marketplace[monthIndex] = marketplaceTotal;
    
    // MICROINFLUENCERS
    if (this.parameters.microinfluencersProgram && month >= 3) {
        const adoptionRate = Math.min(1, (month - 3) / 9);
        contributions.microinfluencers[monthIndex] = baseContribution * 0.08 * adoptionRate * compoundedGrowth;
    } else {
        contributions.microinfluencers[monthIndex] = 0;
    }
    
    // INTERNACIONAL
    if (this.parameters.internationalExpansion && month >= 18) {
        const adoptionRate = Math.min(1, (month - 18) / 6);
        contributions.international[monthIndex] = baseContribution * 0.30 * adoptionRate * compoundedGrowth;
    } else {
        contributions.international[monthIndex] = 0;
    }
    
    // GARANTIR QUE A SOMA DAS CONTRIBUIÇÕES = VALOR SOLLER TOTAL
    const totalContributions = contributions.baseline[monthIndex] + 
                              contributions.techStack[monthIndex] + 
                              contributions.customerSuccess[monthIndex] + 
                              contributions.marketplace[monthIndex] + 
                              contributions.microinfluencers[monthIndex] + 
                              contributions.international[monthIndex];
    
    // Ajustar proporcionalmente se houver diferença
    const ratio = monthData.valorSoller / totalContributions;
    if (Math.abs(ratio - 1) > 0.01) {
        contributions.baseline[monthIndex] *= ratio;
        contributions.techStack[monthIndex] *= ratio;
        contributions.customerSuccess[monthIndex] *= ratio;
        contributions.marketplace[monthIndex] *= ratio;
        contributions.microinfluencers[monthIndex] *= ratio;
        contributions.international[monthIndex] *= ratio;
    }
}

    validateProjection(monthData, month, alerts) {
        const uniqueAlerts = new Set(alerts.map(a => a.message));
        
        if (monthData.gmv > 50000000 && month <= 6) {
            const msg = '⚠️ Crescimento muito agressivo no curto prazo';
            if (!uniqueAlerts.has(msg) && alerts.length < 3) {
                alerts.push({ type: 'warning', message: msg });
            }
        }
        
        if (monthData.margin > 28 && month <= 6) {
            const msg = '📊 Meta de margem muito otimista para curto prazo';
            if (!uniqueAlerts.has(msg) && alerts.length < 3) {
                alerts.push({ type: 'info', message: msg });
            }
        }
        
        if (monthData.churn < 30 && month <= 3) {
            const msg = '🎯 Redução de churn muito rápida';
            if (!uniqueAlerts.has(msg) && alerts.length < 3) {
                alerts.push({ type: 'warning', message: msg });
            }
        }
        
        if (monthData.workingCapital > 15000000) {
            const msg = '💰 Capital de giro elevado - considere funding';
            if (!uniqueAlerts.has(msg) && alerts.length < 3) {
                alerts.push({ type: 'warning', message: msg });
            }
        }

        // NOVO: Validação de capacidade operacional
    const contractsPerPerson = monthData.contracts / monthData.team;
    if (contractsPerPerson > 15) {
        const msg = '⚠️ Sobrecarga operacional: >15 contratos/pessoa';
        if (!uniqueAlerts.has(msg) && alerts.length < 5) {
            alerts.push({ type: 'critical', message: msg });
        }
    }
    
    // NOVO: Validação de ticket vs mercado
    if (monthData.ticketMedio > 50000) {
        const msg = '📊 Ticket médio acima do mercado - validar sustentabilidade';
        if (!uniqueAlerts.has(msg) && alerts.length < 5) {
            alerts.push({ type: 'info', message: msg });
        }
    }
    
    // NOVO: Validação de crescimento vs investimento
    const investmentTotal = this.parameters.techInvestment + this.parameters.brandInvestment;
    if (monthData.gmv > 10000000 && investmentTotal < 1000000) {
        const msg = '💰 Crescimento ambicioso requer mais investimento';
        if (!uniqueAlerts.has(msg) && alerts.length < 5) {
            alerts.push({ type: 'warning', message: msg });
        }
    }
    }

    calculateAggregateMetrics(projections) {
        const safeArray = (arr) => arr && arr.length > 0 ? arr : [0];
        const safeDivision = (a, b) => b !== 0 ? a / b : 0;
        
        return {
            totalGMV: safeArray(projections.gmv).reduce((a, b) => a + b, 0),
            gmvGrowth: safeDivision(
                (projections.gmv[23] || projections.gmv[projections.gmv.length - 1] || 0),
                (projections.gmv[0] || 1)
            ) - 1,
            gmv6m: safeArray(projections.gmv).slice(0, 6).reduce((a, b) => a + b, 0),
            gmv12m: safeArray(projections.gmv).slice(0, 12).reduce((a, b) => a + b, 0),
            gmv24m: safeArray(projections.gmv).reduce((a, b) => a + b, 0),
            totalValorSoller: safeArray(projections.valorSoller).reduce((a, b) => a + b, 0),
            valorSoller6m: safeArray(projections.valorSoller).slice(0, 6).reduce((a, b) => a + b, 0),
            valorSoller12m: safeArray(projections.valorSoller).slice(0, 12).reduce((a, b) => a + b, 0),
            valorSoller24m: safeArray(projections.valorSoller).reduce((a, b) => a + b, 0),
            avgMargin: safeArray(projections.margin).length > 0 ?
                safeArray(projections.margin).reduce((a, b) => a + b, 0) / projections.margin.length : 0,
            valuation: projections.valuation[projections.valuation.length - 1] || 0,
            valuationMultiple: safeDivision(
                projections.valuation[projections.valuation.length - 1] || 0,
                ((projections.valorSoller[projections.valorSoller.length - 1] || 0) * 12)
            ),
            finalChurn: projections.churn[projections.churn.length - 1] || 0,
            finalTeam: projections.team[projections.team.length - 1] || 0,
            contractsTotal: safeArray(projections.contracts).reduce((a, b) => a + b, 0),
            successProbability: this.calculateSuccessProbability(projections),
            riskLevel: this.assessRiskLevel(projections)
        };
    }

    calculateLTV(monthData) {
        const avgTicket = monthData.ticketMedio || this.parameters.ticketMedio;
        const churnRate = monthData.churn / 100;
        const avgLifespan = churnRate > 0 ? 1 / churnRate : 12;
        return avgTicket * avgLifespan * (monthData.margin / 100);
    }

    calculateCAC(monthData) {
        const salesCost = monthData.team * 8000;
        const marketingCost = this.parameters.brandInvestment / 12;
        const newContracts = monthData.contracts / 3;
        return newContracts > 0 ? (salesCost + marketingCost) / newContracts : 0;
    }

    calculateRule40(monthData, previousState) {
        const growthRate = previousState.valorSollerMensal > 0 ? 
            ((monthData.valorSoller - previousState.valorSollerMensal) / previousState.valorSollerMensal) : 0;
        const profitMargin = (monthData.margin - 15) / 100;
        return growthRate + profitMargin;
    }

    calculateSuccessProbability(projections) {
    let probability = 45;
    
    // Ajuste por cenário
    if (this.parameters.scenarioType !== 'personalizado') {
        const scenarioBonus = {
            'pessimista': -10,
            'conservador': 0,
            'realista': 0,
            'otimista': 10
        };
        probability += scenarioBonus[this.parameters.scenarioType] || 0;
    }
    
    // Impacto dos toggles (ajustado)
    if (this.parameters.customerSuccessTeam) probability += 10;
    if (this.parameters.crmImplementation) probability += 7;
    if (this.parameters.salesAutomation) probability += 8;  // NOVO
    if (this.parameters.marketplaceBeta) probability += 8;  // AUMENTADO
    if (this.parameters.marketplaceFull) probability += 12;
    if (this.parameters.selfServicePlatform) probability += 6;  // NOVO
    if (this.parameters.mobileApp) probability += 4;  // NOVO
    if (this.parameters.microinfluencersProgram) probability += 3;  // NOVO
    if (this.parameters.saasRevenue) probability += 10;
    if (this.parameters.internationalExpansion) probability += 8;
    
    // Métricas operacionais
    const finalChurn = projections.churn[projections.churn.length - 1] || 100;
    if (finalChurn < 30) probability += 10;
    else if (finalChurn > 50) probability -= 12;
    
    const finalMargin = projections.margin[projections.margin.length - 1] || 0;
    if (finalMargin > 26) probability += 7;
    
    // Investimentos
    if (this.parameters.techInvestment > 3000000) probability += 8;
    if (this.parameters.brandInvestment > 2000000) probability += 5;  // NOVO
    
    // Capacidade da equipe
    const teamGrowth = projections.team[projections.team.length - 1] / this.parameters.equipeVendas;
    if (teamGrowth < 2) probability += 5;  // crescimento controlado é bom
    else if (teamGrowth > 5) probability -= 10;  // crescimento muito rápido é arriscado
    
    return Math.min(90, Math.max(10, probability));
}

    assessRiskLevel(projections) {
        const metrics = projections.metrics || {};
        const finalChurn = metrics.finalChurn || 100;
        const growthRate = metrics.gmvGrowth || 0;
        const successProbability = metrics.successProbability || 0;
        
        if (finalChurn > 50 || growthRate < 0.2 || successProbability < 25) return 'critical';
        if (finalChurn > 40 || growthRate < 0.5 || successProbability < 40) return 'high';
        if (finalChurn > 30 || growthRate < 0.8 || successProbability < 55) return 'medium';
        return 'low';
    }

    runMonteCarloSimulation(iterations = 10000) {
        const results = [];
        const gmvResults = [];
        const valorSollerResults = [];
        const marginResults = [];
        const originalParams = { ...this.parameters };
        
        for (let i = 0; i < iterations; i++) {
            this.parameters.churnRate = Math.max(20, Math.min(80, 
                originalParams.churnRate + (Math.random() - 0.5) * 25));
            this.parameters.margem = Math.max(18, Math.min(30, 
                originalParams.margem + (Math.random() - 0.5) * 6));
            this.parameters.ticketMedio = Math.max(12000, Math.min(30000,
                originalParams.ticketMedio * (0.85 + Math.random() * 0.3)));
            this.parameters.contratosMes = Math.max(80, Math.min(400,
                originalParams.contratosMes * (0.85 + Math.random() * 0.3)));
            
            const projection = this.calculateProjections();
            results.push(projection.metrics.valuation || 0);
            gmvResults.push(projection.metrics.gmv24m || 0);
            valorSollerResults.push(projection.metrics.valorSoller24m || 0);
            marginResults.push(projection.metrics.avgMargin || 0);
        }
        
        Object.assign(this.parameters, originalParams);
        
        results.sort((a, b) => a - b);
        gmvResults.sort((a, b) => a - b);
        valorSollerResults.sort((a, b) => a - b);
        
        const avgMargin = marginResults.reduce((a, b) => a + b, 0) / marginResults.length;
        
        return {
            p10: results[Math.floor(iterations * 0.1)],
            p25: results[Math.floor(iterations * 0.25)],
            p50: results[Math.floor(iterations * 0.5)],
            p75: results[Math.floor(iterations * 0.75)],
            p90: results[Math.floor(iterations * 0.9)],
            mean: results.reduce((a, b) => a + b, 0) / iterations,
            prob100M: (results.filter(v => v > 100000000).length / iterations) * 100,
            prob500M: (results.filter(v => v > 500000000).length / iterations) * 100,
            prob1B: (results.filter(v => v > 1000000000).length / iterations) * 100,
            
            // Métricas de negócio
            gmvMedian: gmvResults[Math.floor(iterations * 0.5)],
            valorSollerMedian: valorSollerResults[Math.floor(iterations * 0.5)],
            valorSollerP10: valorSollerResults[Math.floor(iterations * 0.1)],
            valorSollerP25: valorSollerResults[Math.floor(iterations * 0.25)],
            valorSollerP50: valorSollerResults[Math.floor(iterations * 0.5)],
            valorSollerP75: valorSollerResults[Math.floor(iterations * 0.75)],
            valorSollerP90: valorSollerResults[Math.floor(iterations * 0.9)],
            probSoller20M: (valorSollerResults.filter(v => v > 20000000).length / iterations) * 100,
            probSoller50M: (valorSollerResults.filter(v => v > 50000000).length / iterations) * 100,
            probGMV200M: (gmvResults.filter(v => v > 200000000).length / iterations) * 100,
            avgMargin: avgMargin,
            
            insights: this.generateMonteCarloInsights(results, iterations),
        };
    }
    
    generateMonteCarloInsights(results, iterations) {
    const insights = [];
    const params = this.parameters;
    
    // Análise dos resultados da simulação
    const median = results.p50 || results[Math.floor(iterations * 0.5)];
    const p90 = results.p90 || results[Math.floor(iterations * 0.9)];
    const p10 = results.p10 || results[Math.floor(iterations * 0.1)];
    const valorSollerMedian = results.valorSollerMedian || (median * 0.22);
    const gmvMedian = results.gmvMedian || (median / 0.22);
    
    // Probabilidades críticas
    const prob1B = results.prob1B || ((results.filter && results.filter(v => v > 1000000000).length / iterations) * 100) || 0;
    const prob500M = results.prob500M || ((results.filter && results.filter(v => v > 500000000).length / iterations) * 100) || 0;
    const prob100M = results.prob100M || ((results.filter && results.filter(v => v > 100000000).length / iterations) * 100) || 0;
    const probSoller50M = results.probSoller50M || 0;
    
    // Análise de viabilidade baseada nos PDFs
    const churnCritico = params.churnRate > 60;
    const margemSaudavel = params.margem > 20;
    const contratosMensal = params.contratosMes;
    const needsCapital = (gmvMedian / 24) > 5000000; // >R$5M/mês precisa capital substancial
    
    // ANÁLISE CRÍTICA DE VIABILIDADE
    insights.push({ type: 'subtitle', message: '🎯 Análise de Viabilidade' });
    
    if (prob1B > 5) {
        insights.push({ 
            type: 'warning', 
            message: `🦄 ${prob1B.toFixed(0)}% de chance unicórnio - ATENÇÃO: Timeline de 24 meses é irrealista. Benchmark: 5-7 anos com investimento de R$100M+`
        });
    }
    
    if (prob500M > 20) {
        insights.push({ 
            type: prob500M > 40 ? 'success' : 'info',
            message: `💎 ${prob500M.toFixed(0)}% probabilidade >R$500M - Viável com execução disciplinada e Series A de R$15-20M`
        });
    } else {
        insights.push({ 
            type: 'warning',
            message: `⚠️ ${prob500M.toFixed(0)}% chance >R$500M - Projeções excessivamente otimistas para condições atuais`
        });
    }
    
    insights.push({ 
        type: 'info',
        message: `📈 Range realista: R$${(p10/1000000).toFixed(0)}M - R$${(p90/1000000).toFixed(0)}M (Mediana: R$${(median/1000000).toFixed(0)}M)`
    });
    
    // CURTO PRAZO (0-6 meses) - Quick Wins
    insights.push({ type: 'subtitle', message: '🚀 Curto Prazo (0-6 meses) - ROI >300%' });
    
    if (churnCritico) {
        insights.push({ 
            type: 'critical',
            message: `🔴 URGENTE: Churn ${params.churnRate.toFixed(0)}% está matando crescimento. Baremetrics reduziu 68%→15% em 2 meses. Implementar intervenção humana AGORA.`
        });
    }
    
    if (!params.customerSuccessTeam) {
        const impactoCS = valorSollerMedian * 0.30;
        insights.push({ 
            type: 'warning',
            message: `💰 Customer Success: Investir R$450k (3 pessoas) → Retorno R$${(impactoCS/1000000).toFixed(1)}M em retenção. ROI: 350% em 12M`
        });
    } else {
        insights.push({ 
            type: 'success',
            message: `✅ CS ativo - Monitorar NPS semanal e health score. Meta: <5% churn mensal em 6 meses`
        });
    }
    
    if (!params.crmImplementation) {
        insights.push({ 
            type: 'warning',
            message: `⚡ CRM urgente: GPTW teve 444% crescimento pós-RD Station. Budget: R$200k, Retorno: +40 contratos/mês`
        });
    }
    
    // Análise de capital de giro
    if (needsCapital) {
        const capitalNecessario = (gmvMedian / 24) * 2.5; // ~2.5 meses de operação
        insights.push({ 
            type: 'warning',
            message: `💸 Working Capital: Necessário R$${(capitalNecessario/1000000).toFixed(0)}M para sustentar crescimento. 82% das falências = má gestão de cashflow`
        });
    }
    
    // MÉDIO PRAZO (6-18 meses) - Platform Building
    insights.push({ type: 'subtitle', message: '🏗️ Médio Prazo (6-18 meses) - Platform Building' });
    
    if (!params.marketplaceBeta && !params.marketplaceFull) {
        insights.push({ 
            type: 'warning',
            message: `🛍️ Marketplace Beta crítico: Investir R$2M → TAM 10x, margem +15pp. Squid tem 150k influencers pré-scale`
        });
    } else if (params.marketplaceBeta && !params.marketplaceFull) {
        insights.push({ 
            type: 'info',
            message: `📱 Marketplace Beta ativo - Evoluir para full marketplace. Target: 1000+ creators em 12M`
        });
    }
    
    if (!params.selfServicePlatform) {
        insights.push({ 
            type: 'info',
            message: `🤖 Self-Service: -60% custo operacional, escala 10x capacidade. Investment: R$800k, payback 8 meses`
        });
    }
    
    // Análise de capacidade operacional
    const contractsNeeded = (gmvMedian / 24) / (params.ticketMedio || 17950);
    const teamNeeded = Math.ceil(contractsNeeded / 10); // 10 contratos por pessoa/mês
    if (teamNeeded > params.equipeVendas * 3) {
        insights.push({ 
            type: 'warning',
            message: `⚠️ Gap operacional: Precisará ${teamNeeded} pessoas vs ${params.equipeVendas} atuais. Automação é ESSENCIAL, não opcional`
        });
    }
    
    // LONGO PRAZO (18+ meses) - Scale & Exit
    insights.push({ type: 'subtitle', message: '🌍 Longo Prazo (18+ meses) - Scale & Exit Strategy' });
    
    if (!params.saasRevenue) {
        insights.push({ 
            type: 'warning',
            message: `💎 SaaS Revenue crítico para exit: Múltiplos 8x (SaaS) vs 2x (agency). Target: R$2M MRR = R$200/creator x 10k base`
        });
    } else {
        insights.push({ 
            type: 'success',
            message: `✅ Modelo SaaS ativo - Focar em net revenue retention >110% para múltiplo premium`
        });
    }
    
    if (!params.internationalExpansion) {
        insights.push({ 
            type: 'info',
            message: `🌎 LATAM = 3x mercado Brasil. Timeline: mês 18+. Modelo: partnerships locais, não abertura de filiais`
        });
    }
    
    // CENÁRIOS DE EXIT
    insights.push({ type: 'subtitle', message: '💰 Cenários de Exit (baseados na simulação)' });
    
    if (prob100M > 80) {
        insights.push({ 
            type: 'success',
            message: `📊 Bear Case (P10): R$${(p10/1000000).toFixed(0)}M - Strategic acquisition por agência maior (2x revenue)`
        });
    }
    
    insights.push({ 
        type: 'info',
        message: `🎯 Base Case (P50): R$${(median/1000000).toFixed(0)}M - Growth equity de PE regional (4x revenue)`
    });
    
    if (prob500M > 30) {
        insights.push({ 
            type: 'success',
            message: `🚀 Bull Case (P90): R$${(p90/1000000).toFixed(0)}M - Series B/C com VC global (6x revenue)`
        });
    }
    
    // RISCOS CRÍTICOS
    insights.push({ type: 'subtitle', message: '⚠️ Riscos Principais & Mitigação' });
    
    if (params.churnRate > 50) {
        insights.push({ 
            type: 'critical',
            message: `🔴 Risco Existencial: Churn ${params.churnRate.toFixed(0)}% inviabiliza qualquer projeção. Benchmark: <30% em 3 meses ou pivotear modelo`
        });
    }
    
    if (params.scenarioType === 'otimista' && prob500M < 50) {
        insights.push({ 
            type: 'warning',
            message: `📉 Cenário otimista com <50% chance de sucesso indica superestimação. Revisar premissas fundamentais`
        });
    }
    
    const capitalTotal = needsCapital ? (gmvMedian / 24) * 2.5 : 8000000;
    insights.push({ 
        type: 'info',
        message: `💵 Capital necessário total: R$${(capitalTotal/1000000).toFixed(0)}M - 40% tech, 30% sales, 20% team, 10% working capital`
    });
    
    // KPIs CRÍTICOS
    insights.push({ type: 'subtitle', message: '📈 KPIs para Monitorar (Weekly War Room)' });
    
    insights.push({ 
        type: 'info',
        message: `🎯 North Star: MRR Growth Rate >15%/mês | Churn <5%/mês | CAC Payback <6 meses | Base Growth >20%/mês`
    });
    
    // BOTTOM LINE
    insights.push({ type: 'subtitle', message: '🎲 Bottom Line da Simulação' });
    
    const successProbability = prob500M > 30 ? 'alta' : prob100M > 70 ? 'moderada' : 'baixa';
    const timelineRealistic = prob1B > 10 ? '5-7 anos' : prob500M > 40 ? '3-5 anos' : '2-3 anos';
    
    insights.push({ 
        type: successProbability === 'alta' ? 'success' : successProbability === 'moderada' ? 'info' : 'warning',
        message: `📊 Probabilidade de sucesso: ${successProbability.toUpperCase()} | Timeline realista: ${timelineRealistic} | Maior risco: ${churnCritico ? 'CHURN CRÍTICO' : 'Execução'}`
    });
    
    const nextStep = churnCritico ? 
        'War room anti-churn HOJE - meta 30 dias para <50%' :
        !params.customerSuccessTeam ? 
        'Contratar Head of CS sênior em 15 dias' :
        !params.crmImplementation ? 
        'Implementar RD Station/HubSpot em 30 dias' :
        'Iniciar desenvolvimento marketplace MVP';
    
    insights.push({ 
        type: 'action',
        message: `⚡ Next Step Imediato: ${nextStep}`
    });
    
    return insights;
}

    getMonthLabel(monthIndex) {
        const date = new Date();
        date.setMonth(date.getMonth() + monthIndex);
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return `${months[date.getMonth()]}/${date.getFullYear()}`;
    }

    formatCurrency(value) {
        if (value >= 1000000000) {
            return `R$ ${(value / 1000000000).toFixed(1)}B`;
        } else if (value >= 1000000) {
            return `R$ ${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `R$ ${(value / 1000).toFixed(0)}K`;
        }
        return `R$ ${value.toFixed(0)}`;
    }
}

window.SollerProjections = SollerProjections;