export function getOriginEndPoint() {
  return process.env.ORIGIN_ENDPOINT ?? 'http://localhost:3000'
}

export function getAdminOriginEndPoint() {
  return process.env.ADMIN_ORIGIN_ENDPOINT ?? 'http://localhost:3000'
}
