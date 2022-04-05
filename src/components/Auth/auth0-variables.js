const AUTH_CONFIG = () => {
  if (process.env.NODE_ENV === 'production') {
    return ({
      domain: process.env.domain,
      clientId: process.env.clientId,
      callbackUrl: process.env.callbackUrl
    })
  }
  else {
    return ({
      domain: 'dev-451mlaqa.us.auth0.com',
      clientId: '8zOpDK4zQtqpir3NzwRqfkWyjWFLrTkA',
      callbackUrl: 'http://localhost:3000/callback'
    })
  }
}

export {AUTH_CONFIG};
