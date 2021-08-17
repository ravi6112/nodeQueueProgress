const express = require('express');
const Queue = require('bull');

let REDIS_URL = 'redis://127.0.0.1:6379';

const app = express();

const workQueue = new Queue('work', REDIS_URL);

workQueue.add('worker_1', { foo: 'bar' });

workQueue.process('worker_1', async (job, done) => {
    // let random = Math.round(Math.random() * 10);
    // console.log('random = ',random);
    // if (random % 5 === 0) {
    //     return Promise.reject(new Error('Error'))
    // }

    // if (random % 9 === 0) {
    //     console.log('insdie 9 random');
    //     return Promise.resolve({ status: 'delete' })
    // }
    // console.log('outside');
    const data = job.data;
    let progress = 0;
    for (let i = 0; i < 10; i++) {
        await doSomething(data);
        progress += 10;

        job.progress(progress).catch(err => {
            console.log({ err }, 'Job progress err');
        });
    }
    done();
    // while(true){}
    return Promise.resolve({ status: 'done' })
});

async function doSomething(data) {
   console.log('do something inside function - '+ data);
}
workQueue.on('error', (error) => {
    console.log(error);
})

workQueue.on('completed', async (job, result) => {
    console.log(`Job ${job.id} completed ${result}`);

    // if (result.status === 'delete') {
    //     await queue.removeRepeatable(job.name, { ...job.opts.repeat })
    // }
})

workQueue.on('failed', (job, err) => {
    console.log(`Job ${job.id} failed ${JSON.stringify(err)}`);
});

workQueue.on('progress', function (job, progress) {
    // A job's progress was updated!
    console.log(`Job ${job.id} progress ${progress} `)
})



