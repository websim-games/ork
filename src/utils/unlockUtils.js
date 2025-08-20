export function checkUnlockConditions(data) {
    const items = document.querySelectorAll('[data-unlock-condition]');
    items.forEach(item => {
        const condition = item.dataset.unlockCondition;
        const [type, value] = condition.split('-');
        
        if (type === 'orkLevel') {
            const requiredLevel = parseInt(value);
            console.log(`Checking unlock condition: Level ${data.monsters.ork.level} >= ${requiredLevel}`);
            if (data.monsters.ork.level >= requiredLevel) {
                item.classList.add('unlocked');
            } else {
                item.classList.remove('unlocked');
            }
        } else if (type === 'upgradeCount') {
            const upgrade = item.dataset.upgrade;
            const requiredCount = parseInt(value);
            const currentCount = data.upgradeCounts[upgrade] || 0;
            if (currentCount >= requiredCount) {
                item.classList.add('unlocked');
            } else {
                item.classList.remove('unlocked');
            }
        }
    });
}