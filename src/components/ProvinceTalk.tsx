import { useEffect, useState, type FormEvent } from 'react'
import { loadComments, saveComment } from '../community'
import { formatDate, initials } from '../format'
import { loadChat, nickKey, saveChat, saveNick, subscribeChat, type ChatLine } from '../province-chat'
import type { PlaceComment } from '../types'

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function ProvinceTalk({ province }: { province: string }) {
  const placeId = `il-${province}`
  const [comments, setComments] = useState<PlaceComment[]>(() => loadComments(placeId))
  const [chat, setChat] = useState<ChatLine[]>(() => loadChat(province))
  const [commentName, setCommentName] = useState('')
  const [commentText, setCommentText] = useState('')
  const [chatName, setChatName] = useState(() => nickKey())
  const [chatText, setChatText] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setComments(loadComments(placeId))
    setChat(loadChat(province))
    setError('')
  }, [placeId, province])

  useEffect(() => {
    return subscribeChat(province, setChat)
  }, [province])

  function onComment(event: FormEvent) {
    event.preventDefault()
    const name = commentName.trim()
    const text = commentText.trim()
    if (name.length < 2 || text.length < 8) {
      setError('Yorum için isim ve en az birkaç cümle yaz.')
      return
    }
    const saved = saveComment({
      id: newId(),
      placeId,
      name,
      text,
      createdAt: new Date().toISOString(),
    })
    setComments(saved)
    setCommentText('')
    setError('')
  }

  function onChat(event: FormEvent) {
    event.preventDefault()
    const name = chatName.trim()
    const text = chatText.trim()
    if (name.length < 2 || text.length < 2) {
      setError('Sohbet için isim ve bir cümle yaz.')
      return
    }
    saveNick(name)
    setChat(
      saveChat({
        id: newId(),
        province,
        name,
        text,
        createdAt: new Date().toISOString(),
      }),
    )
    setChatText('')
    setError('')
  }

  return (
    <div className="land-talk">
      <section className="land-comments" aria-label={`${province} yorumları`}>
        <h3>Görenlerin notu</h3>
        <p className="muted comment-hint">
          Şuraya gidin, şunu görün. Bu tarayıcıda kalır; sunucuya gitmez.
        </p>
        <form className="comment-form" onSubmit={onComment}>
          <label>
            İsmin
            <input value={commentName} onChange={(event) => setCommentName(event.target.value)} maxLength={40} />
          </label>
          <label>
            Görüşün
            <textarea
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              maxLength={800}
              placeholder={`${province} — nereye gidilir, ne güzeldi?`}
            />
          </label>
          <button type="submit" className="btn-fill">
            Yorum bırak
          </button>
        </form>
        {comments.length === 0 ? (
          <p className="muted">İlk sen yaz: buraya gidin, şunu görün.</p>
        ) : (
          <ul className="comment-list">
            {comments.map((comment) => (
              <li key={comment.id} className="comment">
                <span className="avatar" aria-hidden="true">
                  {initials(comment.name)}
                </span>
                <div>
                  <p className="comment-head">
                    <strong>{comment.name}</strong>
                    <span>{formatDate(comment.createdAt)}</span>
                  </p>
                  <p className="comment-text">{comment.text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="land-chat" aria-label={`${province} sohbet`}>
        <h3>Sohbet</h3>
        <p className="muted comment-hint">
          {province} hakkında konuş. “Kampa gideceğim, giden var mı?” diye sor. Aynı tarayıcıda açık sekmeler görür;
          sunucu yok.
        </p>
        <ul className="chat-log" aria-live="polite">
          {chat.length === 0 && <li className="muted">Henüz kimse yazmadı. İlk sen aç.</li>}
          {chat.map((line) => (
            <li key={line.id}>
              <strong>{line.name}</strong>
              <span>{line.text}</span>
              <em>{formatDate(line.createdAt)}</em>
            </li>
          ))}
        </ul>
        <form className="chat-form" onSubmit={onChat}>
          <input
            value={chatName}
            onChange={(event) => setChatName(event.target.value)}
            placeholder="İsmin"
            maxLength={32}
            aria-label="Sohbet ismi"
          />
          <input
            value={chatText}
            onChange={(event) => setChatText(event.target.value)}
            placeholder="Kampa gideceğim, giden var mı?"
            maxLength={240}
            aria-label="Sohbet iletisi"
          />
          <button type="submit" className="btn-fill">
            Gönder
          </button>
        </form>
      </section>
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}
