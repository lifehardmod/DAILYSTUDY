const Pending = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-600"></div>
      <div className="flex flex-col items-center justify-center">
        <p className="text-gray-600 font-medium">
          Render Free 버전 사용중이라서
        </p>
        <p className="text-gray-600 font-medium">
          15분이 지나면 서버가 꺼졌다가 API 요청하면 다시 서버가 켜져요.
        </p>
        <p className="text-gray-600 font-medium">
          나갔다 오셔도 되고 1분정도 걸립니다.
        </p>
      </div>
    </div>
  );
};

export default Pending;
