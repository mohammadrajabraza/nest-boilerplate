type ToSafeAsyncResult<TData> = Promise<{ success: true; data: TData } | { success: false; error: unknown }>;

const toSafeAsync = async <TData>(promise: Promise<TData>): ToSafeAsyncResult<TData> => {
  try {
    const data = await promise;
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
};

export default toSafeAsync;
