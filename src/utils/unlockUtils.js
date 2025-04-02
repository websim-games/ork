export function checkUnlockConditions(data) {
    const items = document.querySelectorAll('[data-unlock-condition]');
    items.forEach(item => {
        const condition = item.dataset.unlockCondition;
        if (condition.startsWith('orkLevel-')) {
            const requiredLevel = parseInt(condition.split('-')[1]);
            console.log(`Checking unlock condition: Level ${data.monsters.ork.level} >= ${requiredLevel}`);
            if (data.monsters.ork.level >= requiredLevel) {
                item.classList.add('unlocked');
            } else {
                item.classList.remove('unlocked');
            }
        }
    });
}