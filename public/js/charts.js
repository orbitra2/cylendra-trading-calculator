// التحقق من وجود بيانات الرسم البياني
if (typeof chartData !== 'undefined') {
    
    // إعداد البيانات
    const months = chartData.monthlyData.map(d => d.month);
    const balanceData = chartData.monthlyData.map(d => d.balance);
    const earningsData = chartData.monthlyData.map(d => d.earnings);
    const cashOutData = chartData.monthlyData.map(d => d.cashOut);
    const reinvestData = chartData.monthlyData.map(d => d.reinvest);
    const roiData = chartData.monthlyData.map(d => d.roi);

    // الرسم البياني الرئيسي - تطور الرصيد والأرباح
    const mainChartCtx = document.getElementById('mainChart');
    if (mainChartCtx) {
        new Chart(mainChartCtx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'الرصيد',
                        data: balanceData,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#667eea',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'الأرباح الشهرية',
                        data: earningsData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#10b981',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        align: 'end',
                        labels: {
                            font: {
                                family: 'Cairo',
                                size: 13,
                                weight: 600
                            },
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                            family: 'Cairo',
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            family: 'Cairo',
                            size: 13
                        },
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += '$' + context.parsed.y.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                family: 'Cairo',
                                size: 12
                            },
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                family: 'Cairo',
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    // الرسم الدائري - توزيع الأرباح
    const pieChartCtx = document.getElementById('pieChart');
    if (pieChartCtx) {
        new Chart(pieChartCtx, {
            type: 'doughnut',
            data: {
                labels: ['إعادة الاستثمار', 'السحوبات النقدية', 'المصاريف'],
                datasets: [{
                    data: [
                        chartData.summary.totalReinvested,
                        chartData.summary.totalCashOut,
                        chartData.summary.totalExpenses
                    ],
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ],
                    borderColor: [
                        '#667eea',
                        '#10b981',
                        '#ef4444'
                    ],
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Cairo',
                                size: 13,
                                weight: 600
                            },
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                            family: 'Cairo',
                            size: 14
                        },
                        bodyFont: {
                            family: 'Cairo',
                            size: 13
                        },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return label + ': $' + value.toLocaleString() + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    }

    // الرسم البياني الشريطي - نسبة العائد الشهري
    const roiChartCtx = document.getElementById('roiChart');
    if (roiChartCtx) {
        new Chart(roiChartCtx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'نسبة العائد (%)',
                    data: roiData,
                    backgroundColor: roiData.map(value => {
                        if (value >= 100) return 'rgba(16, 185, 129, 0.8)';
                        if (value >= 50) return 'rgba(59, 130, 246, 0.8)';
                        if (value >= 20) return 'rgba(245, 158, 11, 0.8)';
                        return 'rgba(239, 68, 68, 0.8)';
                    }),
                    borderColor: roiData.map(value => {
                        if (value >= 100) return '#10b981';
                        if (value >= 50) return '#3b82f6';
                        if (value >= 20) return '#f59e0b';
                        return '#ef4444';
                    }),
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleFont: {
                            family: 'Cairo',
                            size: 14
                        },
                        bodyFont: {
                            family: 'Cairo',
                            size: 13
                        },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return 'نسبة العائد: ' + context.parsed.y.toFixed(2) + '%';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                family: 'Cairo',
                                size: 12
                            },
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                family: 'Cairo',
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    // التمرير السلس إلى النتائج عند تحميل الصفحة
    setTimeout(() => {
        const resultsSection = document.getElementById('results');
        if (resultsSection) {
            resultsSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }, 500);
}

console.log('✅ Charts loaded successfully!');
