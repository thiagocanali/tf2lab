export const useLogsService = () => {
  const search = async (query: string) => {
    return await $fetch('/api/search', {
      method: 'POST',
      body: { query }
    })
  }

  return {
    search
  }
}

export default useLogsService