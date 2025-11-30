# Turn-Based Timer Usage Guide

## Overview

The turn-based timer system allows you to track individual player time during game sessions. Each player starts with a fixed amount of time (e.g., 30 minutes), and their timer only counts down during their own turn.

## Features

✅ **Per-Player Time Tracking**: Each player has their own countdown timer  
✅ **Turn-Based**: Timer runs only for the current player  
✅ **Real-Time Sync**: All players see the same timer state instantly  
✅ **Persistent State**: Timer survives page refreshes  
✅ **Pause/Resume**: Temporarily stop the timer  
✅ **Visual Indicators**: Clear display of current turn and time remaining  
✅ **Multi-Device**: View and control from multiple devices simultaneously  

## How to Use

### 1. Start a Game Session

Navigate to an active game session that has status "Ongoing".

### 2. Enable Turn Timer

In the game session page, you'll see a "Turn-Based Timer" section with an "Enable Timer" button.

Click **"Enable Timer"** to open the initialization dialog.

### 3. Set Default Time

Enter the default time per player in minutes. For example:
- **30 minutes** for a quick game
- **60 minutes** for a standard game
- **90 minutes** for a longer game

Click **"Initialize"** to start the timer system.

### 4. Timer Automatically Starts

The timer will automatically start for the first player in the session. The display shows:
- Current player's name
- Countdown timer in MM:SS format
- List of all players with their remaining times

### 5. Pass the Turn

When a player's turn is complete, click the **"Pass Turn →"** button.

This will:
- Stop the current player's timer
- Save their remaining time
- Start the next player's timer automatically
- Broadcast the change to all connected clients

### 6. Timer Controls

**Pause**: Click the pause button to temporarily stop the timer (e.g., for a bathroom break)

**Resume**: Click resume to continue from where you paused

**Disable Timer**: Permanently disable the timer for this session

### 7. Time Expiry

When a player's time reaches zero:
- The timer displays **"Time Expired!"** in red
- They can still take their turn, but their timer stays at 0:00
- No automatic actions are taken (you control the game rules)

## Example Gameplay Flow

1. **Game Start**: 4 players, each with 30 minutes
   ```
   Player A: 30:00
   Player B: 30:00
   Player C: 30:00
   Player D: 30:00
   ```

2. **Player A's Turn** (takes 3 minutes and 45 seconds)
   - Timer counts down from 30:00
   - Player A clicks "Pass Turn" at 26:15
   ```
   Player A: 26:15 (saved)
   Player B: 30:00 (now active, timer running)
   Player C: 30:00
   Player D: 30:00
   ```

3. **Player B's Turn** (takes 2 minutes and 30 seconds)
   - Timer counts down from 30:00
   - Player B clicks "Pass Turn" at 27:30
   ```
   Player A: 26:15
   Player B: 27:30 (saved)
   Player C: 30:00 (now active, timer running)
   Player D: 30:00
   ```

4. **Continue Until Game Ends**
   - Each player's time decreases only during their turns
   - Total game time can be calculated by adding all time used

## Multi-Player Real-Time Experience

### What Players See

All connected players see the same state simultaneously:
- Current player highlighted in blue
- Live countdown for current player
- Static time display for other players
- Turn changes happen instantly for everyone

### How It Works

The system uses WebSocket technology (Socket.io) to:
1. Broadcast timer events to all clients in the session
2. Synchronize state across multiple browsers/devices
3. Provide smooth, real-time updates

### Joining Mid-Session

If a player joins an ongoing session with an active timer:
1. They automatically connect to the WebSocket room
2. They receive the current timer state
3. They see the live countdown immediately

## Tips and Best Practices

### Before Starting the Game

1. **Agree on Time Limits**: Discuss and decide on appropriate time per player
2. **Test First**: Run a quick test with a short time (e.g., 2 minutes) to familiarize everyone

### During the Game

1. **Be Ready**: Prepare your move before your turn starts to maximize your time
2. **Communicate**: Let others know if you need to pause (bathroom, phone call, etc.)
3. **Pass Promptly**: Click "Pass Turn" immediately after completing your move

### Managing Time Pressure

1. **Check Time Remaining**: Glance at your total remaining time before each turn
2. **Pace Yourself**: Don't spend too much time early in the game
3. **Use Pause Wisely**: Pause for emergencies, not strategy thinking

### Common Scenarios

**Player AFK (Away From Keyboard)**:
- Use the pause button while waiting
- Resume when player returns

**Disputed Move**:
- Pause the timer during discussion
- Resume once resolved

**End of Game**:
- Finish the game session normally
- Timer data is saved with the session

## Technical Details

### Data Persistence

- Timer state is saved to the database
- Player time updates after each turn
- Session survives page refreshes
- Historical time data preserved

### Real-Time Updates

- Timer updates every 100ms for smooth display
- WebSocket events broadcast state changes
- All clients synchronized automatically

### Browser Compatibility

Works with:
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Multiple tabs/windows of same session

## Troubleshooting

### Timer Not Starting

**Solution**: Ensure the game session status is "Ongoing" and you've clicked "Initialize" after enabling the timer.

### Timer Not Syncing

**Solution**: Check your internet connection. Refresh the page to reconnect to the WebSocket server.

### Can't Pass Turn

**Solution**: Ensure the timer is active (not paused). Only active timers allow passing turns.

### Time Discrepancy

**Solution**: All clients calculate time locally for smooth display. Refresh to sync with server state.

### Page Refresh

If you refresh the page:
1. Timer state is preserved in database
2. You'll rejoin the WebSocket room automatically
3. Current state will be displayed correctly

## Advanced Features (Future)

The following features are documented for potential future implementation:

- **Auto-Pass**: Automatically pass turn when time expires
- **Sound Alerts**: Audio warnings at 1 min, 30 sec, 10 sec remaining
- **Time Increments**: Add bonus time after each turn (chess-style)
- **Analytics**: Track average turn time per player
- **Customization**: Different time per player, handicaps
- **Notifications**: Push notifications for turn changes

## Getting Help

For issues or questions:
1. Check the `TURN_TIMER_ARCHITECTURE.md` file for technical details
2. Verify your WebSocket connection is active
3. Check browser console for error messages
4. Create an issue in the repository with details

## Summary

The turn-based timer system enhances your game sessions with:
- Fair time management for all players
- Real-time synchronization across devices
- Easy-to-use controls
- Persistent state and history

Enjoy your games with added time management! 🎲⏱️
