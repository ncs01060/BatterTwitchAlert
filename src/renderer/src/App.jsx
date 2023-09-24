import React, { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [streamerName, setStreamerName] = useState('')
  const [streamInfo, setStreamInfo] = useState(null)
  const [error, setError] = useState(null)
  const [sw, setSW] = useState(false)

  const fetchStreamInfo = async () => {
    try {
      const response = await axios.get(
        `https://api.twitch.tv/helix/streams?user_login=${streamerName}`,
        {
          headers: {
            'Client-ID': '', // 여기에 트위치 개발자 포털에서 생성한 클라이언트 ID를 입력하세요
            Authorization: '' // 여기에 획득한 액세스 토큰을 입력하세요
          }
        }
      )

      const streamData = response.data.data[0]
      setStreamInfo(streamData)
      if (streamData.type) {
        if (!('Notification' in window)) {
          alert('브라우저에서 알림을 지원하지 않습니다.')
          return
        }

        // 알림 권한 요청
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted' && !sw) {
            setSW(true)
            // 알림 생성 및 표시
            const notification = new Notification('방송알림', {
              body: `${streamData.user_name}님이 방송을 켰다구`
            })

            // 알림 클릭 이벤트 처리
            notification.onclick = () => {
              // 클릭 시 이동할 URL 설정
              const urlToOpen = `https://www.twitch.tv/${streamerName}`
              window.open(urlToOpen, '_blank')
            }
            resetStreamInfo()
          }
        })
      }

      setError(null)
    } catch (err) {
      setStreamInfo(null)
      setError('스트리머를 찾을 수 없거나 스트리머가 오프라인 상태입니다.')
    }
  }

  const resetStreamInfo = () => {
    setStreamerName('')
    setSW(false)
    setStreamInfo(null)
    setError(null)
  }

  useEffect(() => {
    // 초기 렌더링 후 30초마다 fetchStreamInfo 함수를 호출
    const intervalId = setInterval(fetchStreamInfo, 3000)

    // 컴포넌트가 언마운트될 때 인터벌 클리어
    return () => clearInterval(intervalId)
  }, [streamerName])

  return (
    <div>
      <h1>Twitch 스트리머 생방송 정보</h1>
      <input
        type="text"
        placeholder="스트리머 아이디 입력"
        value={streamerName}
        onChange={(e) => setStreamerName(e.target.value)}
      />
      <button onClick={fetchStreamInfo}>정보 가져오기</button>

      {error && <p>{error}</p>}

      {streamInfo && (
        <div>
          <p>스트리머: {streamInfo.user_name}</p>
          <p>생방송 중: {streamInfo.type === 'live' ? '예' : '아니오'}</p>
          <p>시작 시간: {new Date(streamInfo.started_at).toLocaleString()}</p>
          <p>시청자 수: {streamInfo.viewer_count}</p>
        </div>
      )}
      <button onClick={resetStreamInfo}>초기화</button>
    </div>
  )
}

export default App
