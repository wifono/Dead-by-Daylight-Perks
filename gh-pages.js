var ghpages = require('gh-pages');

ghpages.publish(
    'public', // path to public directory
    {
        branch: 'gh-pages',
        repo: 'https://wifono.github.io/Dead-by-Daylight-Perks', // Update to point to your repository  
        user: {
            name: 'Wifono', // update to use your name
            email: 'daniel.trstansky@gmail.com' // Update to use your email
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)