const schedule = require('node-schedule');

let job = null;
let context = null;

function configure(nextContext) {
  context = nextContext;
}

function expressionFor(frequency) {
  if (frequency === 'daily') return '0 10 * * *';
  if (frequency === 'monthly') return '0 10 1 * *';
  return '0 10 * * 1';
}

function reschedule() {
  if (job) {
    job.cancel();
    job = null;
  }
  if (!context) return;
  const config = context.store.get('schedule');
  if (!config?.enabled) return;
  job = schedule.scheduleJob(expressionFor(config.frequency), async () => {
    await context.clean();
  });
}

module.exports = { configure, reschedule };
