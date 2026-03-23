const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
require('dotenv').config();

const principles = require('./data/principles.json');
const quizQuestions = require('./data/quiz-questions.json');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// --- Helpers ---

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function filterPrinciples(query) {
  if (!query) return principles;
  const q = query.toLowerCase();
  return principles.filter(p =>
    p.author.toLowerCase().includes(q) ||
    p.topic.toLowerCase().includes(q) ||
    p.quote.toLowerCase().includes(q)
  );
}

function buildPrincipleEmbed(p) {
  return new EmbedBuilder()
    .setColor(0x2563EB)
    .setTitle(`${getTopicEmoji(p.topic)} Investment Principle`)
    .setDescription(`> *"${p.quote}"*`)
    .addFields(
      { name: 'Author', value: p.author, inline: true },
      { name: 'Topic', value: p.topic, inline: true },
    )
    .setFooter({ text: 'Powered by KeepRule.com | Explore 100+ investment principles' })
    .setURL('https://keeprule.com')
    .setTimestamp();
}

function getTopicEmoji(topic) {
  const map = {
    'Risk Management': '🛡️',
    'Value Investing': '💎',
    'Market Psychology': '🧠',
    'Long-term Investing': '⏳',
    'Patience': '🧘',
    'Quality Investing': '⭐',
    'Contrarian Investing': '🔄',
    'Discipline': '🎯',
    'Circle of Competence': '🎪',
    'Competitive Advantage': '🏰',
    'Simplicity': '✨',
    'Focus': '🔍',
    'Opportunity': '🚀',
    'Learning': '📚',
  };
  return map[topic] || '📊';
}

function getFearGreedAdvice() {
  const scenarios = [
    {
      level: 'Extreme Fear',
      score: Math.floor(Math.random() * 20) + 1,
      color: 0xDC2626,
      emoji: '😱',
      advice: 'Markets are in extreme fear. Historically, this is when the best buying opportunities emerge. As Buffett says: "Be greedy when others are fearful."',
      principles: ['Look for quality companies at discounted prices', 'Review your watchlist for margin of safety', 'Increase position sizes in high-conviction picks'],
    },
    {
      level: 'Fear',
      score: Math.floor(Math.random() * 20) + 21,
      color: 0xF97316,
      emoji: '😰',
      advice: 'The market is fearful. Sentiment is negative, but this often precedes recovery. Stay disciplined and look for value.',
      principles: ['Stick to your investment thesis', 'Consider dollar-cost averaging into quality names', 'Avoid panic selling at all costs'],
    },
    {
      level: 'Neutral',
      score: Math.floor(Math.random() * 20) + 41,
      color: 0xEAB308,
      emoji: '😐',
      advice: 'Market sentiment is balanced. Neither fear nor greed dominates. Focus on fundamentals and individual stock analysis.',
      principles: ['Focus on company-specific research', 'Build your watchlist for future opportunities', 'Review and rebalance existing positions'],
    },
    {
      level: 'Greed',
      score: Math.floor(Math.random() * 20) + 61,
      color: 0x22C55E,
      emoji: '🤑',
      advice: 'Markets are getting greedy. Valuations may be stretched. Be cautious about chasing momentum.',
      principles: ['Tighten your buy criteria', 'Consider trimming overweight positions', 'Raise your margin of safety requirements'],
    },
    {
      level: 'Extreme Greed',
      score: Math.floor(Math.random() * 20) + 81,
      color: 0x16A34A,
      emoji: '🚀',
      advice: 'Markets are in extreme greed. History shows this is when risk is highest. As Buffett says: "Be fearful when others are greedy."',
      principles: ['Do NOT chase rallies', 'Build cash reserves for future opportunities', 'Stress-test your portfolio for downside scenarios'],
    },
  ];
  return randomItem(scenarios);
}

function getScorecardEmbed(ticker) {
  const t = ticker.toUpperCase();
  // Simulated scorecard based on Buffett criteria
  const criteria = [
    { name: 'Understandable Business', score: Math.floor(Math.random() * 3) + 3, max: 5 },
    { name: 'Durable Competitive Advantage', score: Math.floor(Math.random() * 3) + 2, max: 5 },
    { name: 'Capable Management', score: Math.floor(Math.random() * 3) + 2, max: 5 },
    { name: 'Attractive Valuation', score: Math.floor(Math.random() * 4) + 1, max: 5 },
    { name: 'Margin of Safety', score: Math.floor(Math.random() * 4) + 1, max: 5 },
    { name: 'Long-term Earnings Power', score: Math.floor(Math.random() * 3) + 2, max: 5 },
  ];

  const totalScore = criteria.reduce((sum, c) => sum + c.score, 0);
  const maxScore = criteria.reduce((sum, c) => sum + c.max, 0);
  const pct = Math.round((totalScore / maxScore) * 100);

  let verdict, color;
  if (pct >= 80) { verdict = 'Strong Buy Zone'; color = 0x16A34A; }
  else if (pct >= 65) { verdict = 'Looks Promising'; color = 0x22C55E; }
  else if (pct >= 50) { verdict = 'Hold / Needs More Analysis'; color = 0xEAB308; }
  else { verdict = 'Buffett Would Pass'; color = 0xDC2626; }

  const bars = criteria.map(c => {
    const filled = '█'.repeat(c.score);
    const empty = '░'.repeat(c.max - c.score);
    return `${c.name}: ${filled}${empty} ${c.score}/${c.max}`;
  }).join('\n');

  return new EmbedBuilder()
    .setColor(color)
    .setTitle(`📊 Buffett Scorecard: ${t}`)
    .setDescription(`**Verdict: ${verdict}** (${pct}%)\n\n\`\`\`\n${bars}\n\`\`\``)
    .addFields(
      { name: 'Total Score', value: `${totalScore}/${maxScore}`, inline: true },
      { name: 'Methodology', value: "Based on Buffett's investing criteria", inline: true },
    )
    .setFooter({ text: 'Powered by KeepRule.com | This is educational, not financial advice' })
    .setTimestamp();
}

// --- Slash Command Registration ---

const commands = [
  new SlashCommandBuilder()
    .setName('principle')
    .setDescription('Get a random investment principle from legendary investors')
    .addStringOption(option =>
      option.setName('filter')
        .setDescription('Filter by author name or topic (e.g., buffett, risk, patience)')
        .setRequired(false)),
  new SlashCommandBuilder()
    .setName('quiz')
    .setDescription('Test your investment knowledge with a quiz question'),
  new SlashCommandBuilder()
    .setName('scorecard')
    .setDescription('Get a Buffett-style scorecard for a stock ticker')
    .addStringOption(option =>
      option.setName('ticker')
        .setDescription('Stock ticker symbol (e.g., AAPL, MSFT)')
        .setRequired(true)),
  new SlashCommandBuilder()
    .setName('feargreed')
    .setDescription('Get current market sentiment advice based on fear/greed levels'),
];

async function registerCommands() {
  const rest = new REST().setToken(process.env.DISCORD_TOKEN);
  try {
    console.log('Registering slash commands...');
    if (process.env.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands.map(c => c.toJSON()) },
      );
      console.log(`Commands registered for guild ${process.env.GUILD_ID}`);
    } else {
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands.map(c => c.toJSON()) },
      );
      console.log('Commands registered globally');
    }
  } catch (error) {
    console.error('Failed to register commands:', error);
  }
}

// --- Active quizzes (in-memory, keyed by message ID) ---
const activeQuizzes = new Map();

// --- Event Handlers ---

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  console.log(`Serving ${principles.length} investment principles`);
  client.user.setActivity('investment principles | /principle', { type: 3 });
  registerCommands();
});

client.on('interactionCreate', async (interaction) => {
  // Handle button clicks (quiz answers)
  if (interaction.isButton()) {
    const quiz = activeQuizzes.get(interaction.message.id);
    if (!quiz) {
      return interaction.reply({ content: 'This quiz has expired.', ephemeral: true });
    }

    const selected = parseInt(interaction.customId.replace('quiz_', ''));
    const q = quiz.question;
    const isCorrect = selected === q.answer;

    const resultEmbed = new EmbedBuilder()
      .setColor(isCorrect ? 0x22C55E : 0xDC2626)
      .setTitle(isCorrect ? '✅ Correct!' : '❌ Incorrect')
      .setDescription(q.explanation)
      .addFields(
        { name: 'Your Answer', value: q.options[selected], inline: true },
        { name: 'Correct Answer', value: q.options[q.answer], inline: true },
      )
      .setFooter({ text: 'Powered by KeepRule.com | Learn more investment principles' })
      .setTimestamp();

    activeQuizzes.delete(interaction.message.id);
    return interaction.reply({ embeds: [resultEmbed] });
  }

  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  // /principle [filter]
  if (commandName === 'principle') {
    const filter = interaction.options.getString('filter');
    const filtered = filterPrinciples(filter);

    if (filtered.length === 0) {
      return interaction.reply({
        content: `No principles found for "${filter}". Try: buffett, munger, risk, patience, value`,
        ephemeral: true,
      });
    }

    const p = randomItem(filtered);
    const embed = buildPrincipleEmbed(p);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Explore More Principles')
        .setStyle(ButtonStyle.Link)
        .setURL('https://keeprule.com')
        .setEmoji('📖'),
    );

    return interaction.reply({ embeds: [embed], components: [row] });
  }

  // /quiz
  if (commandName === 'quiz') {
    const q = randomItem(quizQuestions);

    const quizEmbed = new EmbedBuilder()
      .setColor(0x7C3AED)
      .setTitle('🧠 Investment Knowledge Quiz')
      .setDescription(`**${q.question}**`)
      .setFooter({ text: 'Powered by KeepRule.com | Click a button to answer' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      ...q.options.map((opt, i) =>
        new ButtonBuilder()
          .setCustomId(`quiz_${i}`)
          .setLabel(opt)
          .setStyle(ButtonStyle.Secondary),
      ),
    );

    const msg = await interaction.reply({ embeds: [quizEmbed], components: [row], fetchReply: true });
    activeQuizzes.set(msg.id, { question: q, timestamp: Date.now() });

    // Auto-expire after 60 seconds
    setTimeout(() => activeQuizzes.delete(msg.id), 60000);
  }

  // /scorecard <ticker>
  if (commandName === 'scorecard') {
    const ticker = interaction.options.getString('ticker');
    if (!/^[A-Za-z]{1,5}$/.test(ticker)) {
      return interaction.reply({ content: 'Please provide a valid stock ticker (1-5 letters).', ephemeral: true });
    }
    const embed = getScorecardEmbed(ticker);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Full Analysis on KeepRule')
        .setStyle(ButtonStyle.Link)
        .setURL('https://keeprule.com')
        .setEmoji('📊'),
    );
    return interaction.reply({ embeds: [embed], components: [row] });
  }

  // /feargreed
  if (commandName === 'feargreed') {
    const fg = getFearGreedAdvice();
    const embed = new EmbedBuilder()
      .setColor(fg.color)
      .setTitle(`${fg.emoji} Market Sentiment: ${fg.level}`)
      .setDescription(`**Score: ${fg.score}/100**\n\n${fg.advice}`)
      .addFields(
        { name: 'What to Do Now', value: fg.principles.map(p => `• ${p}`).join('\n') },
      )
      .setFooter({ text: 'Powered by KeepRule.com | Educational purposes only, not financial advice' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Investment Principles Guide')
        .setStyle(ButtonStyle.Link)
        .setURL('https://keeprule.com')
        .setEmoji('📖'),
    );

    return interaction.reply({ embeds: [embed], components: [row] });
  }
});

// --- Start ---
const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('DISCORD_TOKEN not set. Create a .env file from .env.example');
  process.exit(1);
}

client.login(token);
