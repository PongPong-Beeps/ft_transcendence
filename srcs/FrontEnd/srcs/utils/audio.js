export default function fadeOutAudio(audioElement, fadeDuration) {
    const originalVolume = audioElement.volume;
    const fadeStep = originalVolume / (fadeDuration / 10); // 10ms마다 볼륨을 줄일 양 계산

    const fadeAudioInterval = setInterval(() => {
        if (audioElement.volume > fadeStep) {
            audioElement.volume -= fadeStep; // 볼륨을 점차 줄임
        } else {
            // 볼륨이 0에 가까워지면 오디오 정지 및 볼륨을 원래대로 복구
            audioElement.pause();
            audioElement.volume = originalVolume;
            clearInterval(fadeAudioInterval); // 인터벌 종료
        }
    }, 10); // 10ms마다 볼륨 조절
}