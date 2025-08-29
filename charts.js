// ULTIMO charts.js - Configuração e criação de todos os gráficos com verificações

document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que data.js foi carregado
    setTimeout(function() {
        initializeCharts();
    }, 100);
});

function initializeCharts() {
    // Verificar se os dados existem
    if (!window.SollerData) {
        console.error('SollerData não encontrado. Verifique se data.js foi carregado antes de charts.js');
        return;
    }
    
    // Configurações globais do Chart.js
    Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    Chart.defaults.color = '#1f2937';
    
    // Criar todos os gráficos
    createAllCharts();
}

// Função principal para criar todos os gráficos
function createAllCharts() {
    // 1. Gráfico de Origem dos Leads
    createSourceChart();
    
    // 2. Gráfico de Contratos
    createContractsChart();
    
    // 3. Gráfico GMV
    createGMVChart();

    createNichesChart8();

    createServicesChart9();

    createServicesPieChart()
}

// Função para criar gráfico de origem dos leads
function createSourceChart() {
    const sourceCtx = document.getElementById('sourceChart');
    if (!sourceCtx) return;

    // Verificar dados
    if (!window.SollerData.leadSource || !window.SollerData.leadSource.distribution) {
        console.warn('Dados de origem dos leads não encontrados');
        return;
    }

    // Destruir gráfico existente se houver
    if (sourceCtx.chart) {
        sourceCtx.chart.destroy();
    }

    // --- Plugin para o texto central ---
    const centerTextPlugin = {
        id: 'centerText',
        beforeDraw: (chart) => {
            const { width, height, ctx } = chart;
            ctx.restore();
            const fontSize = (height / 114).toFixed(2);
            ctx.font = `bold ${fontSize}em sans-serif`;
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#6c6c6cff';

            const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const text = total.toLocaleString().replace(/\./g, '');

            const textX = Math.round((width - ctx.measureText(text).width) / 2);
            const textY = height / 2 - 19;
            ctx.fillText(text, textX, textY);
            ctx.save();
        }
    };
    // ------------------------------------

    sourceCtx.chart = new Chart(sourceCtx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Outbound', 'Inbound'],
            datasets: [{
                data: [
                    window.SollerData.leadSource.distribution.outbound.count,
                    window.SollerData.leadSource.distribution.inbound.count
                ],
                backgroundColor: ['#FF375F', '#00A8FF'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    reverse: true,
                    labels: {
                        padding: 20,
                        font: {
                            size: 14
                        },
                        color: '#6c6c6cff'
                    },
                    onClick: (e) => e.stopPropagation()
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        },
        plugins: [centerTextPlugin] // <<< Adicione esta linha
    });
}

// Função para criar gráfico de contratos
function createContractsChart() {
    const contractsCtx = document.getElementById('contractsChart');
    if (!contractsCtx) {
        console.warn('Canvas contractsChart não encontrado');
        return;
    }

    const existingChart = Chart.getChart(contractsCtx);
    if (existingChart) {
        existingChart.destroy();
    }
    
    // Dados para o gráfico
    const contractsData = {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        casting: {
            '2023': [0, 5, 23, 75, 114, 97, 69, 101, 62, 78, 79, 60],
            '2024': [45, 46, 54, 69, 61, 65, 80, 77, 92, 102, 73, 103],
            '2025': [68, 74, 82, 110, 122, 107, 94, null, null, null, null, null]
        },
        mailing: {
            '2023': [2, 4, 10, 26, 25, 21, 21, 13, 20, 8, 13, 11],
            '2024': [10, 15, 15, 20, 24, 24, 14, 22, 15, 27, 30, 21],
            '2025': [23, 21, 13, 22, 19, 30, 19, null, null, null, null, null]
        },
        produtos: {
            '2023': [1, 0, 3, 3, 10, 2, 6, 3, 2, 2, 0, 0],
            '2024': [4, 5, 7, 1, 8, 9, 4, 2, 4, 4, 3, 2],
            '2025': [2, 6, 12, 13, 13, 5, 6, null, null, null, null, null]
        },
        total_geral: {
            '2023': [3, 9, 36, 104, 149, 120, 96, 117, 84, 88, 92, 71],
            '2024': [59, 66, 76, 90, 93, 98, 98, 101, 111, 133, 106, 126],
            '2025': [93, 101, 107, 145, 154, 142, 119, null, null, null, null, null]
        }
    };
    
    // Cores fixas para cada produto e para as linhas
    const productColors = {
        'Casting': '#7c3aed',
        'Mailing': '#3b82f6',
        'Produtos': '#16a34a'
    };
    
    const totalLineColors = {
        '2023': '#bbbbbbff',
        '2024': '#626161ff',
        '2025': '#000000ff'
    };
    
    // Objeto para controlar a visibilidade
    let visibilityState = {
        'Casting': true,
        'Mailing': true,
        'Produtos': true,
        'Total Geral': true,
        // Estados individuais por ano
        'Casting_2023': true,
        'Casting_2024': true,
        'Casting_2025': true,
        'Mailing_2023': true,
        'Mailing_2024': true,
        'Mailing_2025': true,
        'Produtos_2023': true,
        'Produtos_2024': true,
        'Produtos_2025': true,
        'Total_2023': true,
        'Total_2024': true,
        'Total_2025': true
    };
    
    // Função para recalcular percentagens dinamicamente baseado na visibilidade
    function calculateDynamicPercentages() {
        const dynamicPercentages = {
            casting: { '2023': [], '2024': [], '2025': [] },
            mailing: { '2023': [], '2024': [], '2025': [] },
            produtos: { '2023': [], '2024': [], '2025': [] }
        };
        
        ['2023', '2024', '2025'].forEach(year => {
            for (let i = 0; i < 12; i++) {
                let visibleTotal = 0;
                
                // Calcular total apenas dos produtos visíveis
                if (visibilityState.Casting && visibilityState[`Casting_${year}`]) {
                    visibleTotal += contractsData.casting[year][i] || 0;
                }
                if (visibilityState.Mailing && visibilityState[`Mailing_${year}`]) {
                    visibleTotal += contractsData.mailing[year][i] || 0;
                }
                if (visibilityState.Produtos && visibilityState[`Produtos_${year}`]) {
                    visibleTotal += contractsData.produtos[year][i] || 0;
                }
                
                if (visibleTotal > 0) {
                    // Calcular percentagens baseadas apenas nos produtos visíveis
                    if (visibilityState.Casting && visibilityState[`Casting_${year}`]) {
                        dynamicPercentages.casting[year][i] = ((contractsData.casting[year][i] || 0) / visibleTotal) * 100;
                    } else {
                        dynamicPercentages.casting[year][i] = 0;
                    }
                    
                    if (visibilityState.Mailing && visibilityState[`Mailing_${year}`]) {
                        dynamicPercentages.mailing[year][i] = ((contractsData.mailing[year][i] || 0) / visibleTotal) * 100;
                    } else {
                        dynamicPercentages.mailing[year][i] = 0;
                    }
                    
                    if (visibilityState.Produtos && visibilityState[`Produtos_${year}`]) {
                        dynamicPercentages.produtos[year][i] = ((contractsData.produtos[year][i] || 0) / visibleTotal) * 100;
                    } else {
                        dynamicPercentages.produtos[year][i] = 0;
                    }
                } else {
                    dynamicPercentages.casting[year][i] = null;
                    dynamicPercentages.mailing[year][i] = null;
                    dynamicPercentages.produtos[year][i] = null;
                }
            }
        });
        
        return dynamicPercentages;
    }
    
    // Função para calcular totais dinâmicos (refatorada)
    function calculateDynamicTotals() {
        const dynamicTotals = {
            '2023': [],
            '2024': [],
            '2025': []
        };
        
        ['2023', '2024', '2025'].forEach(year => {
            for (let i = 0; i < 12; i++) {
                let total = 0;
                let anyBarDatasetIsVisible = false;

                if (visibilityState.Casting && visibilityState[`Casting_${year}`]) {
                    total += contractsData.casting[year][i] || 0;
                    anyBarDatasetIsVisible = true;
                }
                if (visibilityState.Mailing && visibilityState[`Mailing_${year}`]) {
                    total += contractsData.mailing[year][i] || 0;
                    anyBarDatasetIsVisible = true;
                }
                if (visibilityState.Produtos && visibilityState[`Produtos_${year}`]) {
                    total += contractsData.produtos[year][i] || 0;
                    anyBarDatasetIsVisible = true;
                }
                
                // Se nenhum dataset de barra está visível, use o total_geral original se a linha do total estiver visível
                if (!anyBarDatasetIsVisible && visibilityState['Total Geral'] && visibilityState[`Total_${year}`]) {
                    dynamicTotals[year][i] = contractsData.total_geral[year][i] || null;
                } else {
                    dynamicTotals[year][i] = total > 0 ? total : null;
                }
            }
        });
        
        return dynamicTotals;
    }

function updateContractMetrics() {
    const years = ['2023', '2024', '2025'];
    
    years.forEach(year => {
        let totalContracts = 0;
        let monthsWithData = 0;
        let hasVisibleProductData = false; // Flag para verificar se algum produto está visível
        
        // Lógica para somar dados dos produtos visíveis
        if (visibilityState.Casting && visibilityState[`Casting_${year}`]) {
            const data = contractsData.casting[year].filter(value => value !== null);
            totalContracts += data.reduce((sum, value) => sum + value, 0);
            monthsWithData = Math.max(monthsWithData, data.length);
            hasVisibleProductData = true;
        }
        if (visibilityState.Mailing && visibilityState[`Mailing_${year}`]) {
            const data = contractsData.mailing[year].filter(value => value !== null);
            totalContracts += data.reduce((sum, value) => sum + value, 0);
            monthsWithData = Math.max(monthsWithData, data.length);
            hasVisibleProductData = true;
        }
        if (visibilityState.Produtos && visibilityState[`Produtos_${year}`]) {
            const data = contractsData.produtos[year].filter(value => value !== null);
            totalContracts += data.reduce((sum, value) => sum + value, 0);
            monthsWithData = Math.max(monthsWithData, data.length);
            hasVisibleProductData = true;
        }

        if (!hasVisibleProductData && visibilityState['Total Geral'] && visibilityState[`Total_${year}`]) {
            const data = contractsData.total_geral[year].filter(value => value !== null);
            totalContracts = data.reduce((sum, value) => sum + value, 0);
            monthsWithData = data.length;
        }

        let average = 0;
        if (monthsWithData > 0) {
            average = Math.round(totalContracts / monthsWithData);
        }

        const metricElement = document.getElementById(`avg-${year}`);
        if (metricElement) {
            let labelText = '/mês';
            const data2025 = contractsData.total_geral[year].filter(value => value !== null);
            labelText = `/mês`;
            
            metricElement.textContent = `${average} ${labelText}`;
        }
    });
}

    
    function updateChart() {
        const percentageData = calculateDynamicPercentages();
        const dynamicTotals = calculateDynamicTotals();
        const datasets = [];

        // Adiciona datasets de barras (100% stacked) para cada ano
        ['2023', '2024', '2025'].forEach(year => {
            if (visibilityState.Casting && visibilityState[`Casting_${year}`]) {
                datasets.push({
                    label: `Casting ${year}`,
                    data: percentageData.casting[year],
                    backgroundColor: productColors.Casting,
                    yAxisID: 'y',
                    stack: `contracts-${year}`,
                    order: 2
                });
            }
            if (visibilityState.Mailing && visibilityState[`Mailing_${year}`]) {
                datasets.push({
                    label: `Mailing ${year}`,
                    data: percentageData.mailing[year],
                    backgroundColor: productColors.Mailing,
                    yAxisID: 'y',
                    stack: `contracts-${year}`,
                    order: 2
                });
            }
            if (visibilityState.Produtos && visibilityState[`Produtos_${year}`]) {
                datasets.push({
                    label: `Produtos ${year}`,
                    data: percentageData.produtos[year],
                    backgroundColor: productColors.Produtos,
                    yAxisID: 'y',
                    stack: `contracts-${year}`,
                    order: 2
                });
            }
        });

        // Adiciona datasets de linha (Total Geral dinâmico)
        if (visibilityState['Total Geral']) {
            ['2023', '2024', '2025'].forEach(year => {
                if (visibilityState[`Total_${year}`]) {
                    datasets.push({
                        label: `Total Geral ${year}`,
                        data: dynamicTotals[year],
                        type: 'line',
                        borderColor: totalLineColors[year],
                        backgroundColor: 'transparent',
                        borderWidth: 4,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 1,
                        yAxisID: 'y2',
                        order: -1
                    });
                }
            });
        }

        if (contractsCtx.chart) {
            contractsCtx.chart.destroy();
        }
        
        contractsCtx.chart = new Chart(contractsCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: contractsData.labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    title: {
                        display: false
                    },
                    legend: {
                        display: true,
                        position: 'bottom',
                        align: 'center',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'rect',
                            // O padding aqui define a distância entre os itens
                            padding: 2,
                            font: { size: 11 },
                            color: '#7a7a7aff',
                            // Atualize a função generateLabels dentro das opções da legenda:

                            generateLabels: function(chart) {
                                const customLabels = [];
                                
                                // Casting
                                customLabels.push({
                                    text: 'Casting',
                                    fillStyle: visibilityState.Casting ? productColors.Casting : '#666',
                                    strokeStyle: 'transparent',
                                    hidden: false,
                                    category: 'Casting',
                                    fontColor: visibilityState.Casting ? '#6c6c6cff' : '#9e9e9eff',
                                    itemPadding: 0
                                });
                                ['2023', '2024', '2025'].forEach(year => {
                                    customLabels.push({
                                        text: year,
                                        fillStyle: 'transparent',
                                        strokeStyle: 'transparent',
                                        hidden: false,
                                        pointStyle: false,
                                        datasetIndex: `Casting_${year}`,
                                        // A cor do texto muda dinamicamente
                                        fontColor: visibilityState[`Casting_${year}`] ? '#6c6c6cff' : '#9e9e9eff',
                                        // A decoração do texto (riscado) é aplicada somente quando o estado é `false`
                                        textDecoration: visibilityState[`Casting_${year}`] ? '' : 'line-through',
                                        itemPadding: 0
                                    });
                                });
                                
                                // Adiciona espaço extra entre os grupos
                                customLabels.push({
                                    text: '    ',
                                    category: 'spacer',
                                    itemPadding: 20,
                                    hidden: true,
                                    pointStyle: false,
                                    fillStyle: 'transparent',
                                    strokeStyle: 'transparent'
                                });
                                
                                // Mailing
                                customLabels.push({
                                    text: 'Mailing',
                                    fillStyle: visibilityState.Mailing ? productColors.Mailing : '#666',
                                    strokeStyle: 'transparent',
                                    hidden: false,
                                    category: 'Mailing',
                                    fontColor: visibilityState.Mailing ? '#6c6c6cff' : '#9e9e9eff',
                                    itemPadding: 0
                                });
                                ['2023', '2024', '2025'].forEach(year => {
                                    customLabels.push({
                                        text: year,
                                        fillStyle: 'transparent',
                                        strokeStyle: 'transparent',
                                        hidden: false,
                                        pointStyle: false,
                                        datasetIndex: `Mailing_${year}`,
                                        fontColor: visibilityState[`Mailing_${year}`] ? '#6c6c6cff' : '#9e9e9eff',
                                        textDecoration: visibilityState[`Mailing_${year}`] ? '' : 'line-through',
                                        itemPadding: 0
                                    });
                                });
                                
                                // Adiciona espaço extra entre os grupos
                                customLabels.push({
                                    text: '    ',
                                    category: 'spacer',
                                    itemPadding: 20,
                                    hidden: true,
                                    pointStyle: false,
                                    fillStyle: 'transparent',
                                    strokeStyle: 'transparent'
                                });

                                // Produtos
                                customLabels.push({
                                    text: 'Produtos',
                                    fillStyle: visibilityState.Produtos ? productColors.Produtos : '#666',
                                    strokeStyle: 'transparent',
                                    hidden: false,
                                    category: 'Produtos',
                                    fontColor: visibilityState.Produtos ? '#6c6c6cff' : '#9e9e9eff',
                                    itemPadding: 0
                                });
                                ['2023', '2024', '2025'].forEach(year => {
                                    customLabels.push({
                                        text: year,
                                        fillStyle: 'transparent',
                                        strokeStyle: 'transparent',
                                        hidden: false,
                                        pointStyle: false,
                                        datasetIndex: `Produtos_${year}`,
                                        fontColor: visibilityState[`Produtos_${year}`] ? '#6c6c6cff' : '#9e9e9eff',
                                        textDecoration: visibilityState[`Produtos_${year}`] ? '' : 'line-through',
                                        itemPadding: 0
                                    });
                                });

                                // Adiciona espaço extra entre os grupos
                                customLabels.push({
                                    text: '    ',
                                    category: 'spacer',
                                    itemPadding: 20,
                                    hidden: true,
                                    pointStyle: false,
                                    fillStyle: 'transparent',
                                    strokeStyle: 'transparent'
                                });

                                // Total Geral - configuração especial para a linha
                                customLabels.push({
                                    text: 'Total', // Use 'Total Geral' como texto principal
                                    fillStyle: 'transparent',
                                    strokeStyle: visibilityState['Total Geral'] ? '#6c6c6cff' : '#9e9e9eff',
                                    lineWidth: 2,
                                    hidden: false,
                                    category: 'Total Geral',
                                    fontColor: visibilityState['Total Geral'] ? '#6c6c6cff' : '#9e9e9eff',
                                    // Remova a propriedade pointStyle aqui para usar a do pai 'legend'
                                    pointStyle: 'line', // volta para o padrão para garantir que a bolinha apareça
                                    itemPadding: 0
                                });
                                ['2023', '2024', '2025'].forEach(year => {
                                    customLabels.push({
                                        text: year,
                                        fillStyle: 'transparent',
                                        strokeStyle: 'transparent',
                                        hidden: false,
                                        pointStyle: false,
                                        datasetIndex: `Total_${year}`,
                                        fontColor: visibilityState[`Total_${year}`] ? '#6c6c6cff' : '#9e9e9eff', // Muda a cor do texto do ano
                                        textDecoration: visibilityState[`Total_${year}`] ? '' : 'line-through',
                                        itemPadding: 0
                                    });
                                });
                                
                                return customLabels;
                            }
                        },
                        onClick: (e, legendItem, legend) => {
                            if (legendItem.category === 'spacer') {
                                return; // Ignora o clique no espaçador
                            }
                            
                            if (legendItem.category) {
                                // Clicou no nome do produto/categoria
                                const category = legendItem.category;
                                
                                if (category === 'Total Geral') {
                                    visibilityState['Total Geral'] = !visibilityState['Total Geral'];
                                    visibilityState['Total_2023'] = visibilityState['Total Geral'];
                                    visibilityState['Total_2024'] = visibilityState['Total Geral'];
                                    visibilityState['Total_2025'] = visibilityState['Total Geral'];
                                } else {
                                    visibilityState[category] = !visibilityState[category];
                                    // Se ativando a categoria, ativa todos os anos
                                    if (visibilityState[category]) {
                                        visibilityState[`${category}_2023`] = true;
                                        visibilityState[`${category}_2024`] = true;
                                        visibilityState[`${category}_2025`] = true;
                                    } else {
                                        // Se desativando a categoria, desativa todos os anos
                                        visibilityState[`${category}_2023`] = false;
                                        visibilityState[`${category}_2024`] = false;
                                        visibilityState[`${category}_2025`] = false;
                                    }
                                }
                            } else if (legendItem.datasetIndex) {
                                // Clicou em um ano específico
                                visibilityState[legendItem.datasetIndex] = !visibilityState[legendItem.datasetIndex];
                                
                                // Verificar se todos os anos estão desativados para desativar a categoria
                                const category = legendItem.datasetIndex.split('_')[0];
                                if (category !== 'Total') {
                                    const anyYearActive = visibilityState[`${category}_2023`] || 
                                                        visibilityState[`${category}_2024`] || 
                                                        visibilityState[`${category}_2025`];
                                    // Categoria fica ativa se pelo menos um ano estiver ativo
                                    visibilityState[category] = anyYearActive;
                                } else {
                                    const anyYearActive = visibilityState['Total_2023'] || 
                                                        visibilityState['Total_2024'] || 
                                                        visibilityState['Total_2025'];
                                    visibilityState['Total Geral'] = anyYearActive;
                                }
                            }
                            
                            updateChart();
                            updateContractMetrics();
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 12 },
                        padding: 14,
                        displayColors: false,
                        callbacks: {
                            title: function(tooltipItems) {
                                return tooltipItems[0].label;
                            },
                            label: function() {
                                return null;
                            },
                            afterTitle: function(tooltipItems) {
                                const monthIndex = tooltipItems[0].dataIndex;
                                const lines = [];
                                
                                const yearColors = {
                                    '2025': '⚫',
                                    '2024': '🔘',
                                    '2023': '⚪'
                                };
                                
                                // Agrupa os dados por ano e exibe o total e a composição
                                ['2025', '2024', '2023'].forEach(year => {
                                    let totalVisivel = 0;
                                    const castingData = contractsData.casting[year][monthIndex] || 0;
                                    const mailingData = contractsData.mailing[year][monthIndex] || 0;
                                    const produtosData = contractsData.produtos[year][monthIndex] || 0;
                                    const totalGeralData = contractsData.total_geral[year][monthIndex] || 0;

                                    let hasVisibleData = false;
                                    
                                    if (visibilityState.Casting && visibilityState[`Casting_${year}`]) {
                                        totalVisivel += castingData;
                                        hasVisibleData = true;
                                    }
                                    if (visibilityState.Mailing && visibilityState[`Mailing_${year}`]) {
                                        totalVisivel += mailingData;
                                        hasVisibleData = true;
                                    }
                                    if (visibilityState.Produtos && visibilityState[`Produtos_${year}`]) {
                                        totalVisivel += produtosData;
                                        hasVisibleData = true;
                                    }

                                    // Adiciona as informações do ano somente se houver dados visíveis
                                    if (hasVisibleData) {
                                        lines.push(`${yearColors[year]} ${year}: ${totalVisivel}`);
                                        
                                        if (visibilityState.Casting && visibilityState[`Casting_${year}`] && castingData > 0) {
                                            const percentage = Math.round((castingData / totalVisivel) * 100);
                                            lines.push(`  Casting: ${castingData} (${percentage}%)`);
                                        }
                                        
                                        if (visibilityState.Mailing && visibilityState[`Mailing_${year}`] && mailingData > 0) {
                                            const percentage = Math.round((mailingData / totalVisivel) * 100);
                                            lines.push(`  Mailing: ${mailingData} (${percentage}%)`);
                                        }
                                        
                                        if (visibilityState.Produtos && visibilityState[`Produtos_${year}`] && produtosData > 0) {
                                            const percentage = Math.round((produtosData / totalVisivel) * 100);
                                            lines.push(`  Produtos: ${produtosData} (${percentage}%)`);
                                        }
                                    } else if (visibilityState['Total Geral'] && visibilityState[`Total_${year}`] && totalGeralData > 0) {
                                        // Caso apenas o Total Geral esteja visível
                                        lines.push(`${yearColors[year]} ${year}: ${totalGeralData}`);
                                    }

                                    // Adiciona uma linha vazia para separar os anos, exceto para o último
                                    if (lines.length > 0 && year !== '2023') {
                                        lines.push('');
                                    }
                                });

                                return lines;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        stacked: true,
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            },
                            color: '#7a7a7aff',
                            stepSize: 20
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y2: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        ticks: {
                            color: '#7a7a7aff',
                            callback: function(value) {
                                return value;
                            }
                        },
                        grid: {
                            display: false
                        }
                    },
                    x: {
                        ticks: {
                            color: '#7a7a7aff'
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    updateChart();
}

function createGMVChart() {
    const gmvCtx = document.getElementById('gmvChart');
    if (!gmvCtx) return;

    // Destruir gráfico existente de forma segura
    const existingChart = Chart.getChart(gmvCtx);
    if (existingChart) {
        existingChart.destroy();
    }

    // Verificar dados
    if (!window.SollerData.gmv || !window.SollerData.gmv.values || !window.SollerData.gmv.values2) {
        console.warn('Dados de GMV ou de Valor Soller não encontrados');
        return;
    }

    // Preparar dados agrupados por mês
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // Separar dados por ano
    const data2023_gmv = window.SollerData.gmv.values.slice(0, 12);
    const data2024_gmv = window.SollerData.gmv.values.slice(12, 24);
    const data2025_gmv = window.SollerData.gmv.values.slice(24, 36);

    const data2023_soller = window.SollerData.gmv.values2.slice(0, 12);
    const data2024_soller = window.SollerData.gmv.values2.slice(12, 24);
    const data2025_soller = window.SollerData.gmv.values2.slice(24, 36);

    // Dados de margem (se existirem)
    const data2023_margin = window.SollerData.gmv.values3 ? window.SollerData.gmv.values3.slice(0, 12) : null;
    const data2024_margin = window.SollerData.gmv.values3 ? window.SollerData.gmv.values3.slice(12, 24) : null;
    const data2025_margin = window.SollerData.gmv.values3 ? window.SollerData.gmv.values3.slice(24, 36) : null;

    const chartConfig = {
        type: 'bar', // Tipo principal do gráfico
        data: {
            labels: months,
            datasets: [
                // Datasets de GMV como barras
                {
                    label: 'GMV 2023',
                    data: data2023_gmv,
                    type: 'bar',
                    backgroundColor: '#00A8FF',
                    borderRadius: 4,
                    yAxisID: 'y',
                    order: 1
                },
                {
                    label: 'GMV 2024',
                    data: data2024_gmv,
                    type: 'bar',
                    backgroundColor: '#FF375F',
                    borderRadius: 4,
                    yAxisID: 'y',
                    order: 1
                },
                {
                    label: 'GMV 2025',
                    data: data2025_gmv.map((val, idx) => idx < 7 ? val : null),
                    type: 'bar',
                    backgroundColor: '#00e979ff',
                    borderRadius: 4,
                    yAxisID: 'y',
                    order: 1
                },
                // Datasets de Soller como linhas
                {
                    label: 'Soller 2023',
                    data: data2023_soller,
                    type: 'line',
                    borderColor: '#00A8FF',
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    yAxisID: 'y2',
                    order: 0
                },
                {
                    label: 'Soller 2024',
                    data: data2024_soller,
                    type: 'line',
                    borderColor: '#FF375F',
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    yAxisID: 'y2',
                    order: 0
                },
                {
                    label: 'Soller 2025',
                    data: data2025_soller.map((val, idx) => idx < 7 ? val : null),
                    type: 'line',
                    borderColor: '#00e979ff',
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    yAxisID: 'y2',
                    order: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            layout: {
                padding: {
                    right: 10
                }
            },
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    display: true,
                    position: 'top',
                    align: 'middle',
                    labels: {
                        usePointStyle: false,
                        padding: 10,
                        font: {
                            size: 12
                        },
                        color: '#f4f4f4',
                        // Lógica para gerar as legendas agrupadas na ordem GMV, Soller
                        generateLabels: function(chart) {
                            const datasets = chart.data.datasets;
                            const customLabels = [];

                            // Adicionar o cabeçalho 'GMV'
                            customLabels.push({ text: 'GMV', category: 'GMV', fontColor: '#666666', fillStyle: 'transparent', strokeStyle: 'transparent', hidden: false });

                            // Adicionar os anos de GMV (ordem decrescente)
                            datasets.forEach((dataset, index) => {
                                if (dataset.label.includes('GMV')) {
                                    customLabels.push({
                                        text: dataset.label.split(' ')[1],
                                        fillStyle: dataset.backgroundColor,
                                        strokeStyle: 'transparent',
                                        hidden: !chart.isDatasetVisible(index),
                                        datasetIndex: index,
                                        fontColor: '#666666'
                                    });
                                }
                            });

                            // Adicionar espaço extra entre os grupos
                            customLabels.push({ text: ' ', fontColor: '#f4f4f4', fillStyle: 'transparent', strokeStyle: 'transparent', hidden: false, extraPadding: true });
                            customLabels.push({ text: ' ', fontColor: '#f4f4f4', fillStyle: 'transparent', strokeStyle: 'transparent', hidden: false, extraPadding: true });

                            // Adicionar o cabeçalho 'Soller'
                            customLabels.push({ text: 'Soller', category: 'Soller', fontColor: '#666666', fillStyle: 'transparent', strokeStyle: 'transparent', hidden: false });

                            // Adicionar os anos de Soller (ordem decrescente)
                            datasets.forEach((dataset, index) => {
                                if (dataset.label.includes('Soller')) {
                                    customLabels.push({
                                        text: dataset.label.split(' ')[1],
                                        fillStyle: 'transparent',
                                        strokeStyle: dataset.borderColor,
                                        lineWidth: 3,
                                        hidden: !chart.isDatasetVisible(index),
                                        datasetIndex: index,
                                        fontColor: '#666666'
                                    });
                                }
                            });
                            return customLabels;
                        },
                        filter: function(item) {
                            return item.text !== '';
                        }
                    },
                    // Lógica aprimorada para o clique nas legendas
                    onClick: (e, legendItem, legend) => {
                        const ci = legend.chart;

                        // Ignora cliques em itens de espaço ou cabeçalhos que não são categorias
                        if (legendItem.text === ' ') return;

                        if (legendItem.category) {
    // Clicou no cabeçalho (GMV ou Soller)
    const category = legendItem.category;

    // Encontrar todos os datasets da categoria
    const datasetsToToggle = ci.data.datasets
        .map((ds, index) => ({ ds, index }))
        .filter(item => item.ds.label.includes(category));

    // Verificar se todos os datasets dessa categoria estão visíveis
    const allVisible = datasetsToToggle.every(item => ci.isDatasetVisible(item.index));

    // Alternar visibilidade de todos de uma vez
    datasetsToToggle.forEach(item => {
        ci.setDatasetVisibility(item.index, !allVisible);
    });
}
 else {
                            // Clicou em um ano individual
                            ci.setDatasetVisibility(legendItem.datasetIndex, !ci.isDatasetVisible(legendItem.datasetIndex));
                        }

                        ci.update();
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 12
                    },
                    padding: 14,
                    displayColors: false, // Desabilitar as cores padrão
                    callbacks: {
                        // Callback para o título do tooltip
                        title: function(tooltipItems) {
                            return tooltipItems[0].label;
                        },
                        // Remover labels padrão
                        label: function() {
                            return null;
                        },
                        // Adicionar conteúdo customizado após o título
                        afterTitle: function(tooltipItems) {
                            const monthIndex = tooltipItems[0].dataIndex;
                            const chart = tooltipItems[0].chart;
                            const lines = [];
                            
                            // Definir cores dos anos
                            const yearColors = {
                                '2025': '🟢',
                                '2024': '🔴',
                                '2023': '🔵'
                            };
                            
                            // GMV - sempre mostrar se houver dados
                            lines.push('GMV');
                            
                            // Verificar e adicionar GMV 2025
                            if (monthIndex < 7 && data2025_gmv[monthIndex] && chart.isDatasetVisible(2)) {
                                const value = new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(data2025_gmv[monthIndex]);
                                lines.push(`${yearColors['2025']} 2025: ${value}`);
                            }
                            
                            // Verificar e adicionar GMV 2024
                            if (data2024_gmv[monthIndex] && chart.isDatasetVisible(1)) {
                                const value = new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(data2024_gmv[monthIndex]);
                                lines.push(`${yearColors['2024']} 2024: ${value}`);
                            }
                            
                            // Verificar e adicionar GMV 2023
                            if (data2023_gmv[monthIndex] && chart.isDatasetVisible(0)) {
                                const value = new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(data2023_gmv[monthIndex]);
                                lines.push(`${yearColors['2023']} 2023: ${value}`);
                            }
                            
                            // Adicionar espaçamento entre GMV e Soller
                            lines.push('');
                            
                            // Soller - sempre mostrar se houver dados
                            lines.push('Soller');
                            
                            // Armazenar quais anos de Soller estão visíveis
                            const sollerVisibility = {
                                '2025': false,
                                '2024': false,
                                '2023': false
                            };
                            
                            // Verificar e adicionar Soller 2025
                            if (monthIndex < 7 && data2025_soller[monthIndex] && chart.isDatasetVisible(5)) {
                                sollerVisibility['2025'] = true;
                                const value = new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(data2025_soller[monthIndex]);
                                lines.push(`${yearColors['2025']} 2025: ${value}`);
                            }
                            
                            // Verificar e adicionar Soller 2024
                            if (data2024_soller[monthIndex] && chart.isDatasetVisible(4)) {
                                sollerVisibility['2024'] = true;
                                const value = new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(data2024_soller[monthIndex]);
                                lines.push(`${yearColors['2024']} 2024: ${value}`);
                            }
                            
                            // Verificar e adicionar Soller 2023
                            if (data2023_soller[monthIndex] && chart.isDatasetVisible(3)) {
                                sollerVisibility['2023'] = true;
                                const value = new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(data2023_soller[monthIndex]);
                                lines.push(`${yearColors['2023']} 2023: ${value}`);
                            }
                            
                            // Margem - só mostrar se houver dados E se o respectivo Soller estiver visível
                            if (window.SollerData.gmv.values3) {
                                let hasMargin = false;
                                const marginLines = [];
                                
                                // Verificar Margem 2025
                                if (monthIndex < 7 && data2025_margin && data2025_margin[monthIndex] > 0 && sollerVisibility['2025']) {
                                    hasMargin = true;
                                    marginLines.push(`${yearColors['2025']} 2025: ${data2025_margin[monthIndex].toFixed(1)}%`);
                                }
                                
                                // Verificar Margem 2024
                                if (data2024_margin && data2024_margin[monthIndex] > 0 && sollerVisibility['2024']) {
                                    hasMargin = true;
                                    marginLines.push(`${yearColors['2024']} 2024: ${data2024_margin[monthIndex].toFixed(1)}%`);
                                }
                                
                                // Verificar Margem 2023
                                if (data2023_margin && data2023_margin[monthIndex] > 0 && sollerVisibility['2023']) {
                                    hasMargin = true;
                                    marginLines.push(`${yearColors['2023']} 2023: ${data2023_margin[monthIndex].toFixed(1)}%`);
                                }
                                
                                // Só adicionar seção de Margem se houver dados para mostrar
                                if (hasMargin) {
                                    // Adicionar espaçamento antes de Margem
                                    lines.push('');
                                    lines.push('Margem');
                                    lines.push(...marginLines);
                                }
                            }
                            
                            return lines;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Valor Total (R$)',
                        color: '#666',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        callback: function(value) {
                            return (value / 1000000).toFixed(1) + 'M';
                        },
                        color: '#666'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y2: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Valor Soller (R$)',
                        color: '#666',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        callback: function(value) {
                            return (value / 1000).toFixed(0) + 'K';
                        },
                        color: '#666'
                    },
                    grid: {
                        display: false
                    }
                },
                x: {
                    ticks: {
                        color: '#666'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    };
    
    gmvCtx.chart = new Chart(gmvCtx.getContext('2d'), chartConfig);
}

function createNichesChart8() {
    const nichesCtx = document.getElementById('nichesChart8');
    if (!nichesCtx) {
        console.warn('Canvas nichesChart8 não encontrado');
        return;
    }
    
    // Destruir gráfico existente de forma segura
    const existingChart = Chart.getChart(nichesCtx);
    if (existingChart) {
        existingChart.destroy();
    }
    
    // Dados organizados em continuidade temporal (10 trimestres)
    // Q1 2023, Q2 2023, Q3 2023, Q4 2023, Q1 2024, Q2 2024, Q3 2024, Q4 2024, Q1 2025, Q2 2025
    const data = {
        casting_total: [
            41582.07259, 16895.58409, 18560.46276, 16899.37076, // 2023
            18159.39077, 15875.14062, 15463.76302, 17052.76723, // 2024
            19103.06877, 19065.77715 // 2025 (T1 e T2)
        ],
        casting_soller: [
            9354.819704, 2997.33828, 4080.026267, 3695.309858, // 2023
            3847.538634, 2881.680196, 2856.545455, 3167.921796, // 2024
            3873.998273, 3789.990026 // 2025 (T1 e T2)
        ],
        mailing_total: [
            31894.7675, 6615.942029, 11501.6466, 25258.33969, // 2023
            18350.125, 26845.07576, 27515.00043, 22868.38961, // 2024
            47731.24982, 21849.04671 // 2025 (T1 e T2)
        ],
        mailing_soller: [
            4041.03975, 1010.42029, 1891.744415, 3705.120438, // 2023
            2754.975, 5470.069697, 5551.991331, 4375.054545, // 2024
            7884.642821, 3378.951014 // 2025 (T1 e T2)
        ],
        mentoria_total: [
            5812.5, 2784.583333, 4438.5, 22100, // 2023
            3018.75, 5971.666667, 19934.23, 1732.5, // 2024
            15291.30933, 10511.8425 // 2025 (T1 e T2)
        ],
        mentoria_soller: [
            5812.5, 2717.916667, 4438.5, 22100, // 2023
            3018.75, 5791.666667, 19934.23, 1732.5, // 2024
            15291.30933, 9522.556786 // 2025 (T1 e T2)
        ]
    };
    
    // Calcular margens percentuais
    const casting_margin = data.casting_total.map((total, idx) => 
        ((data.casting_soller[idx] / total) * 100)
    );
    const mailing_margin = data.mailing_total.map((total, idx) => 
        ((data.mailing_soller[idx] / total) * 100)
    );
    const mentoria_margin = data.mentoria_total.map((total, idx) => 
        ((data.mentoria_soller[idx] / total) * 100)
    );

    // Labels dos trimestres em continuidade temporal
    const labels = ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 
                   'Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024',
                   'Q1 2025', 'Q2 2025'];

    // Estado do modo de visualização (false = Soller, true = Margem)
    let isMarginMode = false;
    
    const chartConfig = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                // Datasets de Valor Total (Barras Empilhadas) - Eixo Principal Y
                {
                    label: 'Casting Total',
                    data: data.casting_total,
                    type: 'bar',
                    backgroundColor: '#7c3aed',
                    borderColor: 'transparent',
                    borderWidth: 0,
                    borderRadius: 4,
                    yAxisID: 'y',
                    order: 1,
                },
                {
                    label: 'Mailing Total',
                    data: data.mailing_total,
                    type: 'bar',
                    backgroundColor: '#3b82f6',
                    borderColor: 'transparent',
                    borderWidth: 0,
                    borderRadius: 4,
                    yAxisID: 'y',
                    order: 1,
                },
                {
                    label: 'Mentoria Total',
                    data: data.mentoria_total,
                    type: 'bar',
                    backgroundColor: '#16a34a',
                    borderColor: 'transparent',
                    borderWidth: 0,
                    borderRadius: 4,
                    yAxisID: 'y',
                    order: 1,
                },
                // Datasets de Valor Soller (Linhas) - Eixo Secundário Y2
                {
                    label: 'Casting Soller',
                    originalLabel: 'Casting Soller',
                    marginLabel: 'Casting Margem',
                    data: data.casting_soller,
                    originalData: data.casting_soller,
                    marginData: casting_margin,
                    type: 'line',
                    borderColor: '#7c3aed',
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 3,
                    pointBackgroundColor: '#7c3aed',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    borderDash: [],
                    yAxisID: 'y2',
                    order: 0
                },
                {
                    label: 'Mailing Soller',
                    originalLabel: 'Mailing Soller',
                    marginLabel: 'Mailing Margem',
                    data: data.mailing_soller,
                    originalData: data.mailing_soller,
                    marginData: mailing_margin,
                    type: 'line',
                    borderColor: '#3b82f6',
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 3,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    borderDash: [],
                    yAxisID: 'y2',
                    order: 0
                },
                {
                    label: 'Mentoria Soller',
                    originalLabel: 'Mentoria Soller',
                    marginLabel: 'Mentoria Margem',
                    data: data.mentoria_soller,
                    originalData: data.mentoria_soller,
                    marginData: mentoria_margin,
                    type: 'line',
                    borderColor: '#16a34a',
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 3,
                    pointBackgroundColor: '#16a34a',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    borderDash: [],
                    yAxisID: 'y2',
                    order: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            layout: {
                padding: {
                    right: 10
                }
            },
            plugins: {
                title: {
                    display: false,
                    text: 'Casting • Mailing • Mentoria',
                    font: { 
                        size: 16, 
                        weight: 'bold' 
                    },
                    color: '#7a7a7aff',
                    padding: {
                        top: 8,
                        bottom: 6
                    }
                },
                legend: {
                    display: true,
                    position: 'top',
                    align: 'center',
                    labels: {
                        color: '#7a7a7aff',
                        usePointStyle: true,
                        padding: 12,
                        font: {
                            size: 12
                        },
                        // Organizar legendas em grupos como no createServicesChart9
                        generateLabels: function(chart) {
                            const datasets = chart.data.datasets;
                            const customLabels = [];
                            
                            // Adicionar cabeçalho 'Total'
                            customLabels.push({ 
                                text: 'Total', 
                                fontColor: '#7a7a7aff', 
                                fillStyle: 'transparent', 
                                strokeStyle: 'transparent', 
                                hidden: false,
                                fontStyle: 'bold',
                                category: 'Total'
                            });
                            
                            // Adicionar datasets de Total
                            datasets.forEach((dataset, index) => {
                                if (dataset.label.includes('Total')) {
                                    customLabels.push({
                                        text: dataset.label.replace(' Total', ''),
                                        fillStyle: dataset.backgroundColor,
                                        strokeStyle: dataset.borderColor,
                                        hidden: !chart.isDatasetVisible(index),
                                        datasetIndex: index,
                                        fontColor: '#7a7a7aff'
                                    });
                                }
                            });
                            
                            // Adicionar espaçamento
                            customLabels.push({ 
                                text: '    ', 
                                fontColor: '#666666', 
                                fillStyle: 'transparent', 
                                strokeStyle: 'transparent', 
                                hidden: false 
                            });
                            
                            // Adicionar cabeçalho 'Soller' ou 'Margem'
                            const sollerTitle = isMarginMode ? 'Margem' : 'Soller';
                            customLabels.push({ 
                                text: sollerTitle, 
                                fontColor: '#7a7a7aff', 
                                fillStyle: 'transparent', 
                                strokeStyle: 'transparent', 
                                hidden: false,
                                fontStyle: 'bold',
                                category: 'Soller'
                            });
                            
                            // Adicionar datasets de Soller/Margem
                            datasets.forEach((dataset, index) => {
                                if (dataset.originalLabel && dataset.originalLabel.includes('Soller')) {
                                    const labelText = isMarginMode ? 
                                        dataset.marginLabel.replace(' Margem', '') : 
                                        dataset.originalLabel.replace(' Soller', '');
                                    customLabels.push({
                                        text: labelText,
                                        fillStyle: 'transparent',
                                        strokeStyle: dataset.borderColor,
                                        lineWidth: 3,
                                        hidden: !chart.isDatasetVisible(index),
                                        datasetIndex: index,
                                        fontColor: '#7a7a7aff'
                                    });
                                }
                            });
                            
                            return customLabels;
                        }
                    },
                    // ... dentro de plugins: { legend: { onClick: ... }
onClick: (e, legendItem, legend) => {
    const ci = legend.chart;
    
    if (legendItem.category) {
        // Lógica para cabeçalho (Total ou Soller/Margem)
        const category = legendItem.category;
        
        let datasetsToToggle = [];
        if (category === 'Total') {
            datasetsToToggle = ci.data.datasets
                .map((ds, index) => ({ ds, index }))
                .filter(item => item.ds.label.includes('Total'));
        } else {
            // Este `else` agora pega o 'Soller' ou 'Margem'
            datasetsToToggle = ci.data.datasets
                .map((ds, index) => ({ ds, index }))
                .filter(item => item.ds.originalLabel && item.ds.originalLabel.includes('Soller'));
        }
        
        const allVisible = datasetsToToggle.every(item => ci.isDatasetVisible(item.index));
        
        datasetsToToggle.forEach(item => {
            ci.setDatasetVisibility(item.index, !allVisible);
        });
        
    } else if (legendItem.datasetIndex !== undefined) {
        // Lógica original para item individual
        ci.setDatasetVisibility(
            legendItem.datasetIndex, 
            !ci.isDatasetVisible(legendItem.datasetIndex)
        );
    }
    
    ci.update();
}
// ...
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 12
                    },
                    padding: 14,
                    displayColors: false,
                    callbacks: {
                        title: function(tooltipItems) {
                            return tooltipItems[0].label;
                        },
                        label: function() {
                            return null;
                        },
                        afterTitle: function(tooltipItems) {
                            const dataIndex = tooltipItems[0].dataIndex;
                            const chart = tooltipItems[0].chart;
                            const lines = [];
                            
                            // Ícones coloridos para cada serviço (mesmas cores dos datasets)
                            const serviceIcons = {
                                'Casting': '🟣',
                                'Mailing': '🔵',
                                'Mentoria': '🟢'
                            };
                            
                            const services = ['Casting', 'Mailing', 'Mentoria'];
                            
                            // ----- Grupo TOTAL -----
                            lines.push('Total');
                            services.forEach((srv, i) => {
                                const totalDatasetIndex = i; // Casting=0, Mailing=1, Mentoria=2
                                if (chart.isDatasetVisible(totalDatasetIndex)) {
                                    const value = new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0
                                    }).format(chart.data.datasets[totalDatasetIndex].data[dataIndex]);
                                    
                                    lines.push(`${serviceIcons[srv]} ${srv}: ${value}`);
                                }
                            });
                            lines.push('');
                            
                            // ----- Grupo SOLLER/MARGEM -----
                            const sollerTitle = isMarginMode ? 'Margem' : 'Soller';
                            lines.push(sollerTitle);
                            services.forEach((srv, i) => {
                                const sollerDatasetIndex = i + 3; // Casting=3, Mailing=4, Mentoria=5
                                if (chart.isDatasetVisible(sollerDatasetIndex)) {
                                    if (isMarginMode) {
                                        // Mostrar margem percentual
                                        const dataset = chart.data.datasets[sollerDatasetIndex];
                                        const marginValue = dataset.marginData[dataIndex];
                                        lines.push(`${serviceIcons[srv]} ${srv}: ${marginValue.toFixed(1)}%`);
                                    } else {
                                        // Mostrar valor Soller
                                        const value = new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL',
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 0
                                        }).format(chart.data.datasets[sollerDatasetIndex].data[dataIndex]);
                                        
                                        lines.push(`${serviceIcons[srv]} ${srv}: ${value}`);
                                    }
                                }
                            });
                            
                            // Só adicionar seção de Margem se não estivermos no modo margem
                            if (!isMarginMode) {
                                lines.push('');
                                
                                // ----- Grupo MARGEM -----
                                lines.push('Margem');
                                services.forEach((srv, i) => {
                                    const sollerDatasetIndex = i + 3;
                                    const totalDatasetIndex = i;
                                    
                                    if (chart.isDatasetVisible(sollerDatasetIndex) && chart.isDatasetVisible(totalDatasetIndex)) {
                                        const total = chart.data.datasets[totalDatasetIndex].data[dataIndex];
                                        const soller = chart.data.datasets[sollerDatasetIndex].originalData[dataIndex];
                                        const margem = ((soller / total) * 100).toFixed(1) + '%';
                                        
                                        lines.push(`${serviceIcons[srv]} ${srv}: ${margem}`);
                                    }
                                });
                            }
                            
                            return lines;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    position: 'left',
                    stacked: false,
                    title: {
                        display: true,
                        text: 'Valor Total (R$)',
                        color: '#666',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) {
                                return (value / 1000000).toFixed(1) + 'M';
                            }
                            return (value / 1000).toFixed(0) + 'K';
                        },
                        color: '#666',
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    }
                },
                y2: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Valor Soller (R$)',
                        color: '#666',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        callback: function(value) {
                            if (isMarginMode) {
                                return value.toFixed(0) + '%';
                            }
                            if (value >= 1000000) {
                                return (value / 1000000).toFixed(1) + 'M';
                            }
                            return (value / 1000).toFixed(0) + 'K';
                        },
                        color: '#666',
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                },
                x: {
                    stacked: false,
                    ticks: {
                        color: '#666',
                        font: {
                            size: 11
                        },
                        maxRotation: 45,
                        minRotation: 0
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                }
            }
        }
    };
    
    nichesCtx.chart = new Chart(nichesCtx.getContext('2d'), chartConfig);
    
    // Função para alternar entre modo Soller e modo Margem
    function toggleMarginMode() {
        isMarginMode = !isMarginMode;
        
        const chart = nichesCtx.chart;
        const datasets = chart.data.datasets;
        
        // Atualizar datasets das linhas
        datasets.forEach((dataset, index) => {
            if (dataset.originalLabel && dataset.originalLabel.includes('Soller')) {
                if (isMarginMode) {
                    // Mudar para dados de margem
                    dataset.data = [...dataset.marginData]; // Clonar array
                    dataset.label = dataset.marginLabel;
                } else {
                    // Voltar para dados Soller
                    dataset.data = [...dataset.originalData]; // Clonar array
                    dataset.label = dataset.originalLabel;
                }
            }
        });
        
        // Atualizar título do eixo Y2
        chart.options.scales.y2.title.text = isMarginMode ? 
            'Margem Soller (%)' : 
            'Valor Soller (R$)';
        
        // Forçar regeneração das legendas
        chart.options.plugins.legend.labels.generateLabels = chartConfig.options.plugins.legend.labels.generateLabels;
        
        // Atualizar o gráfico
        chart.update();
    }
    
    // Adicionar evento de clique no título do eixo Y2
    nichesCtx.addEventListener('click', function(event) {
        const chart = nichesCtx.chart;
        const canvasPosition = Chart.helpers.getRelativePosition(event, chart);
        const scaleRef = chart.scales.y2;
        
        // Verificar se o clique foi na área do título do eixo Y2
        const titleArea = {
            left: scaleRef.right - 80,
            right: scaleRef.right + 30,
            top: scaleRef.top - 40,
            bottom: scaleRef.bottom + 40
        };
        
        if (canvasPosition.x >= titleArea.left && 
            canvasPosition.x <= titleArea.right &&
            canvasPosition.y >= titleArea.top && 
            canvasPosition.y <= titleArea.bottom) {
            toggleMarginMode();
        }
    });
    
    // Adicionar cursor pointer quando hover sobre o título do eixo Y2
    nichesCtx.addEventListener('mousemove', function(event) {
        const chart = nichesCtx.chart;
        const canvasPosition = Chart.helpers.getRelativePosition(event, chart);
        const scaleRef = chart.scales.y2;
        
        const titleArea = {
            left: scaleRef.right - 80,
            right: scaleRef.right + 30,
            top: scaleRef.top - 40,
            bottom: scaleRef.bottom + 40
        };
        
        if (canvasPosition.x >= titleArea.left && 
            canvasPosition.x <= titleArea.right &&
            canvasPosition.y >= titleArea.top && 
            canvasPosition.y <= titleArea.bottom) {
            nichesCtx.style.cursor = 'pointer';
        } else {
            nichesCtx.style.cursor = 'default';
        }
    });
}

function createServicesChart9() {
    const servicesCtx = document.getElementById('servicesChart9');
    if (!servicesCtx) {
        console.warn('Canvas servicesChart9 não encontrado');
        return;
    }
    
    // Destruir gráfico existente de forma segura
    const existingChart = Chart.getChart(servicesCtx);
    if (existingChart) {
        existingChart.destroy();
    }
    
    // Dados dos serviços incorporados diretamente
    const data = {
        casting_soller: [
            252580.132, 836257.38, 918005.91, 779710.38,
            546350.486, 559045.958, 691284, 858506.8068,
            852279.62, 1265856.669
        ],
        casting_total: [
            1122715.96, 4713867.96, 4176104.12, 3565767.23,
            2578633.49, 3079777.28, 3742230.65, 4621299.92,
            4202675.13, 6367969.568
        ],
        mailing_soller: [
            64656.636, 69719, 100262.454, 118563.854,
            110199, 361024.6, 255391.6012, 336879.2,
            441539.998, 236526.571
        ],
        mailing_total: [
            510316.28, 456500, 609587.27, 808266.87,
            734005, 1771775, 1265690.02, 1760866,
            2672949.99, 1529433.27
        ],
        produto_soller: [
            23250, 32615, 44385, 22100,
            48300, 86875, 199342.3, 15592.5,
            229369.64, 266631.59
        ],
        produto_total: [
            23250, 33415, 44385, 22100,
            48300, 89575, 199342.3, 15592.5,
            229369.64, 294331.59
        ]
    };
    
    // Labels - quarters ou meses
    const labels = window.SollerData?.services?.quarters || 
                  ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 
                   'Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024',
                   'Q1 2025', 'Q2 2025'];
    
    
    const chartConfig = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                // Datasets de Valor Total (Barras) - Eixo Principal Y
                {
                    label: 'Casting Total',
                    data: data.casting_total,
                    type: 'bar',
                    backgroundColor: '#7c3aed',
                    borderColor: 'transparent',   // <-- transparente
  borderWidth: 0, 
                    borderRadius: 4,
                    yAxisID: 'y',
                    order: 1,
                    stack: 'stack1'
                },
                {
                    label: 'Mailing Total',
                    data: data.mailing_total,
                    type: 'bar',
                    backgroundColor: '#3b82f6',
                    borderColor: 'transparent',   // <-- transparente
  borderWidth: 0, 
                    borderRadius: 4,
                    yAxisID: 'y',
                    order: 1,
                    stack: 'stack1'
                },
                {
                    label: 'Produto Total',
                    data: data.produto_total,
                    type: 'bar',
                    backgroundColor: '#16a34a',
                    borderColor: 'transparent',   // <-- transparente
  borderWidth: 0, 
                    borderRadius: 4,
                    yAxisID: 'y',
                    order: 1,
                    stack: 'stack1'
                },
                // Datasets de Valor Soller (Linhas) - Eixo Secundário Y2
                {
                    label: 'Casting Soller',
                    data: data.casting_soller,
                    type: 'line',
                    borderColor: '#7c3aed',
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 3,
                    pointBackgroundColor: '#7c3aed',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    borderDash: [],
                    yAxisID: 'y2',
                    order: 0
                },
                {
                    label: 'Mailing Soller',
                    data: data.mailing_soller,
                    type: 'line',
                    borderColor: '#3b82f6',
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 3,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    borderDash: [],
                    yAxisID: 'y2',
                    order: 0
                },
                {
                    label: 'Produto Soller',
                    data: data.produto_soller,
                    type: 'line',
                    borderColor: '#16a34a',
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 3,
                    pointBackgroundColor: '#16a34a',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    borderDash: [],
                    yAxisID: 'y2',
                    order: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            layout: {
                padding: {
                    right: 10
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Casting (+ Members & Pro) • Mailing • Produto (+ Mentoria)',
                    font: { 
                        size: 16, 
                        weight: 'bold' 
                    },
                    color: '#7a7a7aff',
                    padding: {
                        top: 8,
                        bottom: 6
                    }
                },
                legend: {
                    display: true,
                    position: 'top',
                    align: 'center',
                    labels: {
                        color: '#7a7a7aff',
                        usePointStyle: true,
                        padding: 12,
                        font: {
                            size: 12
                        },
                        // Organizar legendas em grupos
                        generateLabels: function(chart) {
                            const datasets = chart.data.datasets;
                            const customLabels = [];
                            
                            // Adicionar cabeçalho 'Valor Total'
                            customLabels.push({ 
                                text: 'Total', 
                                fontColor: '#7a7a7aff', 
                                fillStyle: 'transparent', 
                                strokeStyle: 'transparent', 
                                hidden: false,
                                fontStyle: 'bold',
                                category: 'Total'
                            });
                            
                            // Adicionar datasets de Total
                            datasets.forEach((dataset, index) => {
                                if (dataset.label.includes('Total')) {
                                    customLabels.push({
                                        text: dataset.label.replace(' Total', ''),
                                        fillStyle: dataset.backgroundColor,
                                        strokeStyle: dataset.borderColor,
                                        hidden: !chart.isDatasetVisible(index),
                                        datasetIndex: index,
                                        fontColor: '#7a7a7aff'
                                    });
                                }
                            });
                            
                            // Adicionar espaçamento
                            customLabels.push({ 
                                text: '    ', 
                                fontColor: '#666666', 
                                fillStyle: 'transparent', 
                                strokeStyle: 'transparent', 
                                hidden: false 
                            });
                            
                            // Adicionar cabeçalho 'Valor Soller'
                            customLabels.push({ 
                                text: 'Soller', 
                                fontColor: '#7a7a7aff', 
                                fillStyle: 'transparent', 
                                strokeStyle: 'transparent', 
                                hidden: false,
                                fontStyle: 'bold',
                                category: 'Soller'
                            });
                            
                            // Adicionar datasets de Soller
                            datasets.forEach((dataset, index) => {
                                if (dataset.label.includes('Soller')) {
                                    customLabels.push({
                                        text: dataset.label.replace(' Soller', ''),
                                        fillStyle: 'transparent',
                                        strokeStyle: dataset.borderColor,
                                        lineWidth: 3,
                                        hidden: !chart.isDatasetVisible(index),
                                        datasetIndex: index,
                                        fontColor: '#7a7a7aff'
                                    });
                                }
                            });
                            
                            return customLabels;
                        }
                    },
                    onClick: (e, legendItem, legend) => {
    const ci = legend.chart;

    if (legendItem.category) {
        // Cabeçalho (Total ou Soller)
        const category = legendItem.category;

        const datasetsToToggle = ci.data.datasets
            .map((ds, index) => ({ ds, index }))
            .filter(item => item.ds.label.includes(category));

        const allVisible = datasetsToToggle.every(item => ci.isDatasetVisible(item.index));

        datasetsToToggle.forEach(item => {
            ci.setDatasetVisibility(item.index, !allVisible);
        });

        ci.update();
    } else if (legendItem.datasetIndex !== undefined) {
        // Item individual
        ci.setDatasetVisibility(
            legendItem.datasetIndex, 
            !ci.isDatasetVisible(legendItem.datasetIndex)
        );
        ci.update();
    }
}

                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 12
                    },
                    padding: 14,
                    displayColors: false,
                    callbacks: {
                        title: function(tooltipItems) {
                            return tooltipItems[0].label;
                        },
                        label: function() {
                            return null;
                        },
                        afterTitle: function(tooltipItems) {
    const dataIndex = tooltipItems[0].dataIndex;
    const chart = tooltipItems[0].chart;
    const lines = [];

    // Ícones coloridos para cada serviço
    const serviceIcons = {
        'Casting': '🟣',
        'Mailing': '🔵',
        'Produto': '🟢'
    };

    const services = ['Casting', 'Mailing', 'Produto'];

    // ----- Grupo TOTAL -----
    lines.push('Total');
    services.forEach((srv, i) => {
        const totalDatasetIndex = i; // Casting=0, Mailing=1, Produto=2
        if (chart.isDatasetVisible(totalDatasetIndex)) {
            const value = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(chart.data.datasets[totalDatasetIndex].data[dataIndex]);

            lines.push(`${serviceIcons[srv]} ${srv}: ${value}`);
        }
    });
    lines.push('');

    // ----- Grupo SOLLER -----
    lines.push('Soller');
    services.forEach((srv, i) => {
        const sollerDatasetIndex = i + 3; // Casting=3, Mailing=4, Produto=5
        if (chart.isDatasetVisible(sollerDatasetIndex)) {
            const value = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(chart.data.datasets[sollerDatasetIndex].data[dataIndex]);

            lines.push(`${serviceIcons[srv]} ${srv}: ${value}`);
        }
    });

    return lines;
}

                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    position: 'left',
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Valor Total (R$)',
                        color: '#666',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) {
                                return (value / 1000000).toFixed(1) + 'M';
                            }
                            return (value / 1000).toFixed(0) + 'K';
                        },
                        color: '#666',
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    }
                },
                y2: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Valor Soller (R$)',
                        color: '#666',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) {
                                return (value / 1000000).toFixed(1) + 'M';
                            }
                            return (value / 1000).toFixed(0) + 'K';
                        },
                        color: '#666',
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                },
                x: {
                    stacked: true,
                    ticks: {
                        color: '#666',
                        font: {
                            size: 11
                        },
                        maxRotation: 45,
                        minRotation: 0
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                }
            }
        }
    };
    
    servicesCtx.chart = new Chart(servicesCtx.getContext('2d'), chartConfig);
}

function createServicesPieChart() {
    const pieCtx = document.getElementById('servicesPieChart');
    if (!pieCtx) {
        console.warn('Canvas servicesPieChart não encontrado');
        return;
    }
    
    // CORREÇÃO: Destruir qualquer gráfico Chart.js existente no canvas para evitar o erro "Canvas is already in use"
    const existingChart = Chart.getChart(pieCtx);
    if (existingChart) {
        existingChart.destroy();
    }
    
    // Dados incorporados diretamente na função
    const servicesData = {
        casting_soller: [
            252580.132, 836257.38, 918005.91, 779710.38,
            546350.486, 559045.958, 691284, 858506.8068,
            852279.62, 1265856.669
        ],
        casting_total: [
            1122715.96, 4713867.96, 4176104.12, 3565767.23,
            2578633.49, 3079777.28, 3742230.65, 4621299.92,
            4202675.13, 6367969.568
        ],
        mailing_soller: [
            64656.636, 69719, 100262.454, 118563.854,
            110199, 361024.6, 255391.6012, 336879.2,
            441539.998, 236526.571
        ],
        mailing_total: [
            510316.28, 456500, 609587.27, 808266.87,
            734005, 1771775, 1265690.02, 1760866,
            2672949.99, 1529433.27
        ],
        produto_soller: [
            23250, 32615, 44385, 22100,
            48300, 86875, 199342.3, 15592.5,
            229369.64, 266631.59
        ],
        produto_total: [
            23250, 33415, 44385, 22100,
            48300, 89575, 199342.3, 15592.5,
            229369.64, 294331.59
        ],
        quarters: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 
                     'Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024',
                     'Q1 2025', 'Q2 2025']
    };
    
    let pieChartInstance = null;
    let currentChartData = null;
    // Manter hiddenIndices persistente entre atualizações
    let hiddenIndices = window.pizzaHiddenIndices || [];
    window.pizzaHiddenIndices = hiddenIndices;
    
    // Função para calcular valores baseado nos filtros
    function calculatePieValues() {
        // Verificar se elementos existem antes de acessar
        const tipoValorElement = document.querySelector('input[name="pizzaTipoValor"]:checked');
        const periodoElement = document.getElementById('pizzaPeriodoSelect');
        
        // Valores padrão se elementos não existirem
        const tipoValor = tipoValorElement ? tipoValorElement.value : 'total';
        const periodo = periodoElement ? periodoElement.value : 'all';
        
        let castingData = tipoValor === 'total' ? [...servicesData.casting_total] : [...servicesData.casting_soller];
        let mailingData = tipoValor === 'total' ? [...servicesData.mailing_total] : [...servicesData.mailing_soller];
        let produtoData = tipoValor === 'total' ? [...servicesData.produto_total] : [...servicesData.produto_soller];
        
        let periodLabel = 'todos os períodos';
        let indices = [];
        
        // Determinar índices baseado no período
        if (periodo === 'all') {
            indices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
            periodLabel = 'todos os períodos';
        } else if (periodo === '2023') {
            indices = [0, 1, 2, 3];
            periodLabel = '2023';
        } else if (periodo === '2024') {
            indices = [4, 5, 6, 7];
            periodLabel = '2024';
        } else if (periodo === '2025') {
            indices = [8, 9];
            periodLabel = '2025 (Jan-Jul)';
        } else if (!isNaN(parseInt(periodo))) {
            // Quarter individual
            indices = [parseInt(periodo)];
            periodLabel = servicesData.quarters[parseInt(periodo)];
        } else {
            // Fallback para todos os períodos
            indices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        }
        
        // Somar valores dos períodos selecionados
        let castingSum = indices.reduce((sum, i) => sum + (castingData[i] || 0), 0);
        let mailingSum = indices.reduce((sum, i) => sum + (mailingData[i] || 0), 0);
        let produtoSum = indices.reduce((sum, i) => sum + (produtoData[i] || 0), 0);
        
        // Sempre mostrar todos os serviços
        let labels = ['Casting', 'Mailing', 'Produto'];
        let values = [castingSum, mailingSum, produtoSum];
        let colors = ['#7c3aed', '#3b82f6', '#16a34a'];
        
        // Calcular total geral para margem
        let totalGeral = 0;
        if (tipoValor === 'soller') {
            totalGeral += indices.reduce((sum, i) => sum + (servicesData.casting_total[i] || 0), 0);
            totalGeral += indices.reduce((sum, i) => sum + (servicesData.mailing_total[i] || 0), 0);
            totalGeral += indices.reduce((sum, i) => sum + (servicesData.produto_total[i] || 0), 0);
        }
        
        return {
            labels,
            values,
            colors,
            periodLabel,
            tipoValor,
            total: values.reduce((a, b) => a + b, 0),
            totalGeral
        };
    }
    
    // Função para recalcular valores visíveis
    function getVisibleData() {
        const visibleValues = currentChartData.values.map((val, idx) => 
            hiddenIndices.includes(idx) ? 0 : val
        );
        const visibleTotal = visibleValues.reduce((a, b) => a + b, 0);
        return { visibleValues, visibleTotal };
    }
    
    // Função para atualizar o gráfico
    function updatePieChart() {
        currentChartData = calculatePieValues();
        // Manter hiddenIndices persistente
        hiddenIndices = window.pizzaHiddenIndices || [];
        
        // Destruir gráfico existente se houver
        if (pieChartInstance) {
            pieChartInstance.destroy();
        }
        
        // Filtrar os dados para incluir apenas os visíveis
        const visibleLabels = currentChartData.labels.filter((_, idx) => !hiddenIndices.includes(idx));
        const visibleValues = currentChartData.values.filter((_, idx) => !hiddenIndices.includes(idx));
        const visibleColors = currentChartData.colors.filter((_, idx) => !hiddenIndices.includes(idx));

        pieChartInstance = new Chart(pieCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: visibleLabels,
                datasets: [{
                    data: visibleValues,
                    backgroundColor: visibleColors,
                    borderWidth: 1,
                    borderColor: '#fff',
                    hoverOffset: 1,
                    hoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `${currentChartData.tipoValor === 'total' ? 'Valor total' : 'Valor Soller'} em ${currentChartData.periodLabel}`,
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        padding: 20,
                        color: 'whitesmoke'
                    },
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 15,
                            font: {
                                size: 13,
                                family: "'Inter', sans-serif"
                            },
                            usePointStyle: true,
                            pointStyle: 'rectRounded',
                            // Gerar rótulos para todos os serviços, incluindo os ocultos
                            generateLabels: function(chart) {
                                const data = currentChartData;
                                const { visibleTotal } = getVisibleData();
                                
                                return data.labels.map((label, i) => {
                                    const hidden = hiddenIndices.includes(i);
                                    const value = data.values[i];
                                    const percentage = visibleTotal > 0 && !hidden ? 
                                        ((value / visibleTotal) * 100).toFixed(1) : 
                                        '0.0';
                                    
                                    return {
                                        text: `${label}: ${hidden ? '---' : percentage + '%'}`,
                                        fillStyle: hidden ? '#cccccc' : data.colors[i],
                                        strokeStyle: hidden ? '#cccccc' : data.colors[i],
                                        hidden: false,
                                        index: i,
                                        textDecoration: hidden ? 'line-through' : '',
                                        fontColor: 'whitesmoke'
                                    };
                                });
                            }
                        },
                        // Lidar com o clique na legenda para alternar a visibilidade
                        onClick: function(e, legendItem, legend) {
                            const index = legendItem.index;
                            
                            // Toggle visibility
                            if (hiddenIndices.includes(index)) {
                                hiddenIndices = hiddenIndices.filter(i => i !== index);
                            } else {
                                hiddenIndices.push(index);
                            }
                            
                            // Atualizar estado global
                            window.pizzaHiddenIndices = hiddenIndices;
                            
                            // Recriar o gráfico completamente
                            updatePieChart();
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 12
                        },
                        padding: 12,
                        filter: function(tooltipItem) {
                            // Mostrar apenas a dica de ferramenta para os itens visíveis
                            const itemIndex = currentChartData.labels.indexOf(tooltipItem.label);
                            return !hiddenIndices.includes(itemIndex);
                        },
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const { visibleTotal } = getVisibleData();
                                const percentage = visibleTotal > 0 ? ((value / visibleTotal) * 100).toFixed(1) : '0.0';
                                const formatted = new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(value);
                                return `${label}: ${formatted} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        updatePizzaStats(currentChartData);
    }
    
    // Função para atualizar estatísticas
    function updatePizzaStats(chartData) {
        const statsContainer = document.getElementById('pizzaStatsContainer');
        if (!statsContainer) return;
        
        const { visibleValues, visibleTotal } = getVisibleData();
        
        statsContainer.innerHTML = '';
        
        // Card de Total Geral (apenas valores visíveis)
        const totalCard = document.createElement('div');
        totalCard.className = 'pizza-stat-card total';
        totalCard.innerHTML = `
            <div class="stat-label">Total ${chartData.tipoValor === 'total' ? 'GMV' : 'Soller'}</div>
            <div class="stat-value">${new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(visibleTotal)}</div>
            <div class="stat-detail">${chartData.periodLabel}</div>
        `;
        statsContainer.appendChild(totalCard);
        
        // Cards individuais para cada serviço (apenas visíveis)
        chartData.labels.forEach((label, index) => {
            if (!hiddenIndices.includes(index)) {
                const value = visibleValues[index];
                const percentage = visibleTotal > 0 ? ((value / visibleTotal) * 100).toFixed(1) : '0.0';
                
                const card = document.createElement('div');
                card.className = `pizza-stat-card ${label.toLowerCase()}`;
                card.innerHTML = `
                    <div class="stat-label">${label}</div>
                    <div class="stat-value">${new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    }).format(value)}</div>
                    <div class="stat-detail">${percentage}% do total</div>
                `;
                statsContainer.appendChild(card);
            }
        });
if (chartData.tipoValor === 'soller' && visibleTotal > 0) {
    // Calcular o total geral (GMV) apenas para os serviços visíveis
    let visibleTotalGeral = 0;
    const tipoValorTotal = {
        casting: servicesData.casting_total,
        mailing: servicesData.mailing_total,
        produto: servicesData.produto_total
    };
    
    // Iterar sobre os serviços para somar apenas os visíveis
    chartData.labels.forEach((label, index) => {
        if (!hiddenIndices.includes(index)) {
            // Encontrar os dados GMV correspondentes ao serviço
            const serviceKey = `${label.toLowerCase()}_total`;
            if (tipoValorTotal[label.toLowerCase()]) {
                const indices = periodoSelect.value === 'all' ? 
                                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : 
                                (periodoSelect.value === '2023' ? [0, 1, 2, 3] : 
                                (periodoSelect.value === '2024' ? [4, 5, 6, 7] : 
                                (periodoSelect.value === '2025' ? [8, 9] : 
                                [parseInt(periodoSelect.value)])));
                
                const sumTotal = indices.reduce((sum, i) => sum + (tipoValorTotal[label.toLowerCase()][i] || 0), 0);
                visibleTotalGeral += sumTotal;
            }
        }
    });

    if (visibleTotalGeral > 0) {
        const margem = ((visibleTotal / visibleTotalGeral) * 100).toFixed(1);
        const margemCard = document.createElement('div');
        margemCard.className = 'pizza-stat-card margem';
        margemCard.innerHTML = `
            <div class="stat-label">Margem Média</div>
            <div class="stat-value">${margem}%</div>
            <div class="stat-detail">Soller / Total</div>
        `;
        statsContainer.appendChild(margemCard);
    }
}
    }
    
    // Event listeners com verificação de existência
    const tipoValorRadios = document.querySelectorAll('input[name="pizzaTipoValor"]');
    if (tipoValorRadios.length > 0) {
        tipoValorRadios.forEach(radio => {
            radio.addEventListener('change', updatePieChart);
        });
    }
    
    const periodoSelect = document.getElementById('pizzaPeriodoSelect');
    if (periodoSelect) {
        periodoSelect.addEventListener('change', updatePieChart);
    }

    // Chamar a função de atualização para a renderização inicial
    updatePieChart();
}

// Função createCharts global para compatibilidade
window.createCharts = function() {
    createAllCharts();
};