export const useLogsService = () => {
  const search = async (query: string, page = 1, perPage = 10) => {
    return await $fetch('/api/search', {
      method: 'POST',
      body: { query, page, perPage }
    })
  }

  return {
    search
  }
}

export default useLogsService