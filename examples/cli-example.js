#!/usr/bin/env node

/**
 * CLI Example - Demonstra como reutilizar o core do ContributionGraph
 * Usage: node cli-example.js [year] [author]
 */

const fs = require('fs');
const path = require('path');

// Simula o módulo ContributionGraph para Node.js
const ContributionGraph = {
  formatISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  alignToSunday(date) {
    const d = new Date(date);
    const dow = d.getDay();
    d.setDate(d.getDate() - dow);
    return d;
  },

  alignToSaturday(date) {
    const d = new Date(date);
    const dow = d.getDay();
    const offset = (6 - dow + 7) % 7;
    d.setDate(d.getDate() + offset);
    return d;
  },

  intensityLevel(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 9) return 3;
    return 4;
  },

  parseActivityData(jsonData) {
    if (!jsonData) return { daily_metrics: {}, metadata: {} };
    
    if (jsonData.daily_metrics) {
      return {
        daily_metrics: jsonData.daily_metrics,
        metadata: jsonData.metadata || {}
      };
    }
    
    if (jsonData.counts) {
      return {
        daily_metrics: jsonData.counts,
        metadata: {}
      };
    }
    
    return { daily_metrics: {}, metadata: {} };
  },

  buildGridFromCounts(dailyMetrics, year) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);
    const startSunday = this.alignToSunday(startOfYear);
    const endSaturday = this.alignToSaturday(endOfYear);
    
    const weeks = [];
    const cursor = new Date(startSunday);
    
    while (cursor <= endSaturday) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const key = this.formatISO(cursor);
        const count = dailyMetrics[key] || 0;
        week.push({
          date: key,
          count: count,
          level: this.intensityLevel(count)
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
    }
    
    return weeks;
  },

  calculateStats(dailyMetrics) {
    const counts = Object.values(dailyMetrics);
    const total = counts.reduce((sum, count) => sum + count, 0);
    const days = counts.filter(count => count > 0).length;
    const max = Math.max(...counts, 0);
    const avg = days > 0 ? (total / days).toFixed(1) : 0;
    
    return { total, days, max, avg };
  },

  loadData(year, author) {
    const filePath = path.join(__dirname, 'analytics', `activity-${year}-${author}.json`);
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(data);
      return this.parseActivityData(jsonData);
    } catch (error) {
      console.error(`❌ Erro ao carregar ${filePath}: ${error.message}`);
      return null;
    }
  },

  generateASCII(dailyMetrics, year) {
    const symbols = ['·', '▢', '▣', '▦', '■'];
    const grid = this.buildGridFromCounts(dailyMetrics, year);
    const stats = this.calculateStats(dailyMetrics);
    
    let ascii = `\n📊 Contribution Graph ${year}\n`;
    ascii += `${'='.repeat(50)}\n`;
    ascii += `Total: ${stats.total} commits in ${stats.days} active days\n`;
    ascii += `Max: ${stats.max} commits/day | Avg: ${stats.avg} commits/active day\n\n`;
    
    // Month labels
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let monthLine = '    ';
    let currentMonth = -1;
    
    grid.forEach((week, weekIndex) => {
      const firstDay = new Date(week[0].date);
      const month = firstDay.getMonth();
      if (month !== currentMonth && weekIndex % 4 === 0) {
        monthLine += months[month].padEnd(4);
        currentMonth = month;
      } else {
        monthLine += '    ';
      }
    });
    ascii += monthLine + '\n';
    
    // Day labels and grid
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let day = 0; day < 7; day++) {
      let line = dayLabels[day] + ' ';
      grid.forEach(week => {
        const cell = week[day];
        line += symbols[cell.level];
      });
      ascii += line + '\n';
    }
    
    ascii += `\nLegenda: ${symbols[0]} (0) ${symbols[1]} (1-2) ${symbols[2]} (3-5) ${symbols[3]} (6-9) ${symbols[4]} (10+)\n`;
    return ascii;
  }
};

// CLI Logic
function main() {
  const args = process.argv.slice(2);
  const year = args[0] ? parseInt(args[0]) : new Date().getFullYear();
  const author = args[1] || 'felipemacedo1';

  console.log(`🔍 Carregando dados para ${author} em ${year}...`);

  const data = ContributionGraph.loadData(year, author);
  
  if (!data) {
    console.log(`❌ Arquivo não encontrado: analytics/activity-${year}-${author}.json`);
    process.exit(1);
  }

  const { daily_metrics, metadata } = data;
  const stats = ContributionGraph.calculateStats(daily_metrics);

  if (stats.total === 0) {
    console.log(`📭 Nenhuma contribuição encontrada para ${author} em ${year}`);
    process.exit(0);
  }

  // Mostra informações de metadata
  if (metadata.generated_at) {
    const lastUpdate = new Date(metadata.generated_at).toLocaleDateString('pt-BR');
    console.log(`📅 Última atualização: ${lastUpdate}`);
  }

  // Gera e exibe o ASCII
  const ascii = ContributionGraph.generateASCII(daily_metrics, year);
  console.log(ascii);

  // Estatísticas extras
  console.log(`📈 Estatísticas detalhadas:`);
  console.log(`   • Dias ativos: ${stats.days}/365 (${(stats.days/365*100).toFixed(1)}%)`);
  console.log(`   • Maior streak: Calcular streak seria uma feature adicional`);
  console.log(`   • Commits por mês: Calcular por mês seria uma feature adicional`);
}

if (require.main === module) {
  main();
}

module.exports = ContributionGraph;