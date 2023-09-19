const cron = require('node-cron')
const battleManager = require('./battleManager')
const { Character } = require('../../../../Models/model')
const { traits, applyCritDamage } = require('../characterFiles/traits')
const LevelUpSystem = require('../characterFiles/levelUpSystem') // Replace with actual path to LevelUpSystem

let cronTask

function applyDamage(attacker, defender) {
  // Store the defender's starting health before the attack
  const startingHealth = defender.current_health

  const randHit = Math.random() * 100
  let isCrit = false
  let actualDamage

  if (randHit < attacker.chance_to_hit * 100) {
    let minDamage = attacker.effective_damage * 0.08
    // console.log(`${attacker.character_name}: min damage ${minDamage}`)
    let maxDamage = attacker.effective_damage * 0.12
    // console.log(`${attacker.character_name}: max damage ${maxDamage}`)

    if (randHit < attacker.crit_chance * 100) {
      console.log(`${attacker.character_name} landed a critical hit!`)
      isCrit = true
      console.log(isCrit)
      minDamage *= 1.5
      // console.log(`${attacker.character_name}: crit min damage ${minDamage}`)
      maxDamage *= 1.5
      // console.log(`${attacker.character_name}: crit max damage ${maxDamage}`)
    }

    // Ensure minDamage is less than or equal to maxDamage
    if (minDamage > maxDamage) {
      minDamage = maxDamage
    }

    actualDamage = Math.floor(
      Math.random() * (maxDamage - minDamage + 1) + minDamage
    )

    const bufferDamage = Math.min(actualDamage, defender.buffer_health)
    // Subtract bufferDamage from buffer_health only if buffer health is available
    if (defender.buffer_health > 0) {
      defender.buffer_health = Math.max(
        0,
        defender.buffer_health - bufferDamage
      )
    }

    // Calculate the actual damage taken after considering the buffer
    const damageTaken = actualDamage - bufferDamage

    // Calculate the resulting health
    defender.current_health = Math.max(0, defender.current_health - damageTaken)

    // Calculate the change in starting health
    const healthChange = startingHealth - defender.current_health

    // console.log(`Debug: Starting Health: ${startingHealth}`)
    // console.log(`Debug: ${attacker.character_name} Full Damage: ${actualDamage}`)
    // console.log(`Debug: Buffer Health: ${defender.buffer_health}`)
    // console.log(`Debug: Buffer Damage: ${bufferDamage}`)
    // console.log(`Debug: ${defender.character_name} Actual Damage Taken: ${damageTaken}`)
    // console.log(`Debug: ${defender.character_name} Resulting Health: ${defender.current_health}`)
    // console.log(`Debug: Change in ${defender.character_name} Starting Health: ${healthChange}`)
  } else {
    console.log(`${attacker.character_name} misses.`)
    return
  }
  if (isCrit && traits[defender.character_name]?.onCritReceived) {
    traits[defender.character_name].onCritReceived(defender, attacker)
  }
}

const setupBattleLogic = () => {
  if (Object.keys(battleManager).length <= 1) return

  cronTask = cron.schedule('*/5 * * * * *', async () => {
    if (Object.keys(battleManager).length <= 1) {
      cronTask.stop()
      return
    }

    for (const battleKey of Object.keys(battleManager)) {
      const battle = battleManager[battleKey]
      if (!battle) continue

      const { characterInstance, enemyInstance } = battle
      if (!characterInstance || !enemyInstance) continue

      console.log('Character Health Before: ', characterInstance.current_health)
      console.log('Enemy Health Before: ', enemyInstance.current_health)
      applyDamage(characterInstance, enemyInstance)
      applyDamage(enemyInstance, characterInstance)
      console.log('Character Health After: ', characterInstance.current_health)
      console.log('Enemy Health After: ', enemyInstance.current_health)

      if (
        characterInstance.current_health <= 0 ||
        enemyInstance.current_health <= 0
      ) {
        console.log('Battle ends.')
        delete battleManager[battleKey]

        // Check if character survived the battle
        if (characterInstance.current_health > 0) {
          const earnedXP = 500 // Define your XP logic here
          await LevelUpSystem.levelUp(characterInstance.character_id, earnedXP)
          // Increment consecutive_kill counter
          characterInstance.consecutive_kill += 1
        } else {
          // Reset consecutive_kill counter
          characterInstance.consecutive_kill = 0
        }

        // Save updated consecutive_kill value to the database
        try {
          await Character.update(
            { consecutive_kill: characterInstance.consecutive_kill },
            { where: { character_id: characterInstance.character_id } }
          )
        } catch (e) {
          console.error('Failed to update consecutive_kill:', e)
        }

        // Check if enemy survived the battle
        if (enemyInstance.current_health > 0) {
          // Enemy-specific logic here, if needed
        }

        if (Object.keys(battleManager).length <= 1) {
          cronTask.stop()
        }
      }
    }
  })
}

// Run the setup function once to initiate the cron job
setupBattleLogic()

module.exports = { setupBattleLogic, applyDamage, applyCritDamage }
