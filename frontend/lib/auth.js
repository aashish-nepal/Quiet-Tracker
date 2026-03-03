export function buildIdentityHeaders({ authToken, demoUserId, enableDemoMode = false }) {
  if (authToken) {
    return {
      authorization: `Bearer ${authToken}`
    };
  }

  if (enableDemoMode && demoUserId) {
    return {
      'x-user-id': demoUserId
    };
  }

  return {};
}
