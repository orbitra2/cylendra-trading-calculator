from flask import Flask, render_template_string, request
import json

app = Flask(__name__)

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>حاسبة أرباح التداول | Trading Calculator</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            direction: rtl;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            color: white;
            margin-bottom: 30px;
            animation: fadeInDown 0.8s ease;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }

        .main-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            animation: fadeIn 1s ease;
        }

        @media (max-width: 968px) {
            .main-content {
                grid-template-columns: 1fr;
            }
        }

        .card {
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            transition: transform 0.3s ease;
        }

        .card:hover {
            transform: translateY(-5px);
        }

        .card-title {
            font-size: 1.5em;
            color: #667eea;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 600;
            font-size: 0.95em;
        }

        .form-group input {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 1em;
            transition: all 0.3s ease;
            direction: ltr;
            text-align: right;
        }

        .form-group input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .btn-calculate {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1.1em;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-calculate:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .btn-calculate:active {
            transform: translateY(0);
        }

        .results-section {
            grid-column: 1 / -1;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            animation: scaleIn 0.5s ease;
        }

        .stat-card h3 {
            font-size: 0.9em;
            opacity: 0.9;
            margin-bottom: 10px;
        }

        .stat-card .value {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .stat-card .currency {
            font-size: 0.8em;
            opacity: 0.8;
        }

        .table-container {
            overflow-x: auto;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
        }

        thead {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        th, td {
            padding: 15px;
            text-align: center;
            border-bottom: 1px solid #f0f0f0;
        }

        th {
            font-weight: 600;
            font-size: 0.95em;
        }

        tbody tr {
            transition: background 0.3s ease;
        }

        tbody tr:hover {
            background: #f8f9ff;
        }

        tbody tr:nth-child(even) {
            background: #f9f9f9;
        }

        tbody tr:nth-child(even):hover {
            background: #f0f2ff;
        }

        .chart-container {
            margin-top: 30px;
            padding: 20px;
            background: white;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        canvas {
            max-height: 400px;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes scaleIn {
            from {
                opacity: 0;
                transform: scale(0.9);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        .info-tooltip {
            display: inline-block;
            width: 18px;
            height: 18px;
            background: #667eea;
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 18px;
            font-size: 12px;
            cursor: help;
            margin-right: 5px;
        }

        .growth-indicator {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 0.85em;
            font-weight: bold;
        }

        .growth-positive {
            background: #d4edda;
            color: #155724;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 حاسبة أرباح التداول</h1>
            <p>احسب أرباحك المتوقعة من التداول مع إعادة الاستثمار</p>
        </div>

        <div class="main-content">
            <div class="card">
                <h2 class="card-title">⚙️ إعدادات الحساب</h2>
                <form method="POST" id="calculatorForm">
                    <div class="form-group">
                        <label>
                            <span class="info-tooltip">?</span>
                            رأس المال الأولي ($)
                        </label>
                        <input type="number" name="principal" step="0.01" value="1000" required>
                    </div>

                    <div class="form-group">
                        <label>
                            <span class="info-tooltip">?</span>
                            الربح لكل صفقة ($)
                        </label>
                        <input type="number" name="profit_trade" step="0.01" value="10" required>
                    </div>

                    <div class="form-group">
                        <label>
                            <span class="info-tooltip">?</span>
                            عدد الصفقات يومياً
                        </label>
                        <input type="number" name="trades_day" value="5" required>
                    </div>

                    <div class="form-group">
                        <label>
                            <span class="info-tooltip">?</span>
                            نسبة إعادة الاستثمار (0-100%)
                        </label>
                        <input type="number" name="reinvest" step="0.01" value="50" min="0" max="100" required>
                    </div>

                    <div class="form-group">
                        <label>
                            <span class="info-tooltip">?</span>
                            عدد الأيام
                        </label>
                        <input type="number" name="days" value="365" required>
                    </div>

                    <button type="submit" class="btn-calculate">🚀 احسب الأرباح</button>
                </form>
            </div>

            <div class="card">
                <h2 class="card-title">ℹ️ معلومات مهمة</h2>
                <div style="color: #666; line-height: 1.8;">
                    <p style="margin-bottom: 15px;"><strong>📌 كيف تعمل الحاسبة:</strong></p>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin-bottom: 10px;">✅ احسب الربح اليومي = الربح لكل صفقة × عدد الصفقات</li>
                        <li style="margin-bottom: 10px;">✅ قسّم الربح: جزء للاستثمار وجزء للسحب</li>
                        <li style="margin-bottom: 10px;">✅ الرصيد ينمو تلقائياً مع إعادة الاستثمار</li>
                        <li style="margin-bottom: 10px;">✅ تقارير شهرية مفصلة</li>
                    </ul>
                    <p style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 10px; font-size: 0.9em;">
                        <strong>⚠️ تنبيه:</strong> هذه الحاسبة للأغراض التعليمية فقط. التداول ينطوي على مخاطر.
                    </p>
                </div>
            </div>

            {% if results %}
            <div class="card results-section">
                <h2 class="card-title">📈 النتائج ({{ days }} يوم)</h2>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>💰 الرصيد النهائي</h3>
                        <div class="value">${{ results['final_balance'] }}</div>
                        <div class="currency">دولار أمريكي</div>
                    </div>
                    <div class="stat-card">
                        <h3>💵 إجمالي الأرباح</h3>
                        <div class="value">${{ results['total_earnings'] }}</div>
                        <div class="currency">دولار أمريكي</div>
                    </div>
                    <div class="stat-card">
                        <h3>🏦 إجمالي السحوبات</h3>
                        <div class="value">${{ results['cash_out'] }}</div>
                        <div class="currency">دولار أمريكي</div>
                    </div>
                    <div class="stat-card">
                        <h3>📊 نسبة النمو</h3>
                        <div class="value">{{ results['growth_percent'] }}%</div>
                        <div class="currency">من رأس المال</div>
                    </div>
                </div>

                <h3 style="margin: 30px 0 20px; color: #667eea; font-size: 1.3em;">📅 التفصيل الشهري</h3>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>الشهر</th>
                                <th>الأرباح ($)</th>
                                <th>إعادة الاستثمار ($)</th>
                                <th>السحوبات ($)</th>
                                <th>الرصيد ($)</th>
                                <th>النمو</th>
                            </tr>
                        </thead>
                        <tbody>
                            {% for row in table %}
                            <tr>
                                <td><strong>{{ row['month'] }}</strong></td>
                                <td>{{ row['earnings'] }}</td>
                                <td>{{ row['reinvest'] }}</td>
                                <td>{{ row['cash_out'] }}</td>
                                <td><strong>{{ row['balance'] }}</strong></td>
                                <td>
                                    <span class="growth-indicator growth-positive">
                                        +{{ row['growth'] }}%
                                    </span>
                                </td>
                            </tr>
                            {% endfor %}
                        </tbody>
                    </table>
                </div>

                <div class="chart-container">
                    <canvas id="balanceChart"></canvas>
                </div>
            </div>
            {% endif %}
        </div>
    </div>

    {% if results %}
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        const chartData = {{ chart_data|safe }};
        
        const ctx = document.getElementById('balanceChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'الرصيد ($)',
                    data: chartData.balance,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }, {
                    label: 'السحوبات التراكمية ($)',
                    data: chartData.cashout,
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'تطور الرصيد والسحوبات',
                        font: { size: 16 }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    </script>
    {% endif %}
</body>
</html>
"""

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        try:
            # استلام البيانات من النموذج
            principal = float(request.form["principal"])
            profit_trade = float(request.form["profit_trade"])
            trades_day = int(request.form["trades_day"])
            reinvest_percent = float(request.form["reinvest"]) / 100
            days = int(request.form["days"])

            # المتغيرات الأساسية
            balance = principal
            monthly_table = []
            month = 1
            
            # بيانات الرسم البياني
            chart_labels = []
            chart_balance = []
            chart_cashout = []
            cumulative_cashout = 0

            # حساب يومي
            monthly_earnings = 0
            monthly_reinvest = 0
            monthly_cashout = 0

            for d in range(1, days + 1):
                daily_profit = profit_trade * trades_day
                reinvest = daily_profit * reinvest_percent
                cashout = daily_profit - reinvest
                
                balance += reinvest
                cumulative_cashout += cashout
                
                monthly_earnings += daily_profit
                monthly_reinvest += reinvest
                monthly_cashout += cashout

                # كل 30 يوم أو اليوم الأخير
                if d % 30 == 0 or d == days:
                    growth_percent = round(((balance - principal) / principal) * 100, 2)
                    
                    monthly_table.append({
                        "month": f"الشهر {month}",
                        "earnings": f"{monthly_earnings:,.2f}",
                        "reinvest": f"{monthly_reinvest:,.2f}",
                        "cash_out": f"{monthly_cashout:,.2f}",
                        "balance": f"{balance:,.2f}",
                        "growth": growth_percent
                    })
                    
                    # بيانات الرسم البياني
                    chart_labels.append(f"الشهر {month}")
                    chart_balance.append(round(balance, 2))
                    chart_cashout.append(round(cumulative_cashout, 2))
                    
                    month += 1
                    monthly_earnings = 0
                    monthly_reinvest = 0
                    monthly_cashout = 0

            # النتائج النهائية
            total_earned = sum([float(r["earnings"].replace(',', '')) for r in monthly_table])
            total_cashed = sum([float(r["cash_out"].replace(',', '')) for r in monthly_table])
            growth_percent = round(((balance - principal) / principal) * 100, 2)

            results = {
                "final_balance": f"{balance:,.2f}",
                "total_earnings": f"{total_earned:,.2f}",
                "cash_out": f"{total_cashed:,.2f}",
                "growth_percent": growth_percent
            }

            chart_data = {
                "labels": chart_labels,
                "balance": chart_balance,
                "cashout": chart_cashout
            }

            return render_template_string(
                HTML_TEMPLATE, 
                results=results, 
                table=monthly_table, 
                days=days,
                chart_data=json.dumps(chart_data)
            )
        
        except Exception as e:
            return f"<h2>خطأ في المدخلات: {str(e)}</h2>", 400

    return render_template_string(HTML_TEMPLATE, results=None)

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
