# Review Bot
###### A commission developed by KingsDev

![A review being placed](https://github.com/user-attachments/assets/8691a57c-e1fc-4d68-8fe4-4eff8f05b9af)
###### To see more of my work, including more screenshots, go to https://kingrabbit.dev/

Review Bot is a useful tool for community members to build trust within their server by gaining reviews from other members.  Reviews are stored in one channel for easy customisable lookup by members.  Members can also view another user's review overview - this contains the target's received reviews and their average rating.

## Commands
`<>` required parameter  
`[]` optional parameter

### `/set-review-location <channel>`
Used by server staff to set the channel where reviews will be posted.  This must be done before any reviews can be made.

### `/review <user> <rating> <review>`
Review another user with a rating of 1-5.  This review is sent to the channel set by server staff and stored in that user's review overview.

### `/reviews <user>`
View another user's reviews and average rating.

## Running the bot
The bot is built using Node.js 20.  To run the bot, install the required dependencies with `npm i` and then run the bot with `npm run start`.  
The bot requires environment variables to be set (optionally through the creation of a `.env` file):
- `BOT_ID` - The bot's user ID.
- `BOT_TOKEN` - The bot token.
- `MONGO_URI` - The MongoDB URI the bot should connect to.  This database will be used to store the giveaways.
