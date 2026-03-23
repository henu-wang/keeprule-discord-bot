# KeepRule Discord Bot

Investment principles bot for Discord. Get daily wisdom from Warren Buffett, Charlie Munger, and more legendary investors.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/keeprule-discord-bot?referralCode=keeprule)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/henu-wang/keeprule-discord-bot)

## Commands

| Command | Description |
|---------|-------------|
| `/principle` | Random investment principle |
| `/principle buffett` | Random Buffett principle |
| `/principle risk` | Risk management principles |
| `/quiz` | Investment knowledge quiz |
| `/scorecard AAPL` | Buffett-style stock scorecard |
| `/feargreed` | Market fear/greed sentiment advice |

## Setup

### 1. Create a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** and name it `KeepRule`
3. Go to **Bot** tab, click **Add Bot**
4. Copy the **Token** (keep it secret!)
5. Enable these **Privileged Gateway Intents**: none needed (we only use slash commands)
6. Copy the **Application ID** from the General Information tab

### 2. Invite the Bot to Your Server

Replace `YOUR_CLIENT_ID` with your Application ID:

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=2147485696&scope=bot%20applications.commands
```

Permissions included: Send Messages, Embed Links, Use Slash Commands.

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:
- `DISCORD_TOKEN` - Bot token from step 1
- `CLIENT_ID` - Application ID from step 1
- `GUILD_ID` - (Optional) Your test server ID for instant command registration

### 4. Run Locally

```bash
npm install
npm start
```

### 5. Deploy

#### Railway (recommended)
1. Click the "Deploy on Railway" button above
2. Set environment variables: `DISCORD_TOKEN`, `CLIENT_ID`
3. Deploy

#### Render
1. Click the "Deploy to Render" button above
2. Set environment variables in the Render dashboard
3. Deploy as a **Background Worker** (not a Web Service)

#### Docker
```bash
docker build -t keeprule-discord-bot .
docker run -d --env-file .env keeprule-discord-bot
```

#### VPS / PM2
```bash
npm install -g pm2
pm2 start bot.js --name keeprule-discord
pm2 save
```

## Data

- `data/principles.json` - 100+ investment principles from legendary investors
- `data/quiz-questions.json` - 20 investment knowledge quiz questions

## Powered by

[KeepRule.com](https://keeprule.com) - Investment principles from the world's greatest investors.

## License

MIT
