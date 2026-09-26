import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  Form,
  InputGroup,
  ListGroup,
  Badge,
} from 'react-bootstrap';
import {
  FiMessageCircle,
  FiSend,
  FiArrowLeft,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

import api, { getImageUrl } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(
    /\/api\/?$/,
    ''
  );

const Chat = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [chats, setChats] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);

  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const selectedFromList = useMemo(
    () => chats.find((chat) => chat._id === selectedId),
    [chats, selectedId]
  );

  const fetchChats = async () => {
    try {
      const { data } = await api.get('/chats');

      setChats(data.data || []);

      if (selectedId) {
        const current = (data.data || []).find(
          (chat) => chat._id === selectedId
        );

        if (current) {
          setSelectedChat(current);
        }
      }
    } catch (error) {
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const openChat = async (id) => {
    setSelectedId(id);

    try {
      const { data } = await api.get(`/chats/${id}`);
      setSelectedChat(data.data);
    } catch (error) {
      toast.error('Failed to open chat');
    }
  };

  useEffect(() => {
    fetchChats();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const chatId = searchParams.get('chatId');

    if (chatId) {
      openChat(chatId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (!user?.token) return;

    const socket = io(SOCKET_URL, {
      auth: {
        token: user.token,
      },
    });

    socket.on('connect_error', () => {
      // REST messaging still works if real-time connection is unavailable.
    });

    socket.on('newMessage', ({ chatId, message }) => {
      if (chatId === selectedId) {
        setSelectedChat((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, message],
                lastMessageAt: message.createdAt,
              }
            : prev
        );
      }

      fetchChats();
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [user?.token, selectedId]);

  useEffect(() => {
    if (selectedId && socketRef.current) {
      socketRef.current.emit('joinChat', selectedId);
    }
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [selectedChat?.messages?.length]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const value = text.trim();

    if (!value || !selectedId || sending) {
      return;
    }

    setSending(true);

    try {
      const { data } = await api.post(
        `/chats/${selectedId}/messages`,
        {
          text: value,
        }
      );

      setSelectedChat((prev) => {
        if (!prev) return prev;

        const exists = prev.messages.some(
          (message) => message._id === data.data._id
        );

        return exists
          ? prev
          : {
              ...prev,
              messages: [
                ...prev.messages,
                data.data,
              ],
            };
      });

      setText('');

      fetchChats();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Failed to send message'
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const otherParticipant = (chat) =>
    chat?.participants?.find(
      (participant) =>
        participant._id !== user?._id
    );

  return (
    <div
      className="py-3"
      style={{
        maxWidth: 1100,
        margin: '0 auto',
      }}
    >
      {/* HEADER */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <FiMessageCircle size={24} />

        <h4 className="cc-section-title mb-0">
          Messages
        </h4>
      </div>

      {/* CHAT CONTAINER */}
      <div
        className="bg-white rounded-4 shadow-sm overflow-hidden"
        style={{
          minHeight: 600,
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
        }}
      >

        {/* CONVERSATION LIST */}
        <div className="border-end">

          <div className="p-3 border-bottom fw-semibold">
            Conversations
          </div>

          {chats.length === 0 ? (
            <div className="p-4 text-muted text-center">
              No conversations yet.

              <div className="small mt-2">
                Open an item and click the Chat button.
              </div>
            </div>
          ) : (
            <ListGroup variant="flush">

              {chats.map((chat) => {
                const other =
                  otherParticipant(chat);

                const last =
                  chat.messages?.[
                    chat.messages.length - 1
                  ];

                return (
                  <ListGroup.Item
                    action
                    active={
                      chat._id === selectedId
                    }
                    key={chat._id}
                    onClick={() =>
                      openChat(chat._id)
                    }
                    className="py-3"
                  >
                    <div className="fw-semibold">
                      {other?.name || 'User'}
                    </div>

                    {/* ITEM NAME */}
                    <div className="small text-muted text-truncate">
                      {chat.itemId?.title ||
                        'Item conversation'}
                    </div>

                    {/* LAST MESSAGE */}
                    {last && (
                      <div className="small text-muted text-truncate">
                        {last.text}
                      </div>
                    )}
                  </ListGroup.Item>
                );
              })}

            </ListGroup>
          )}

        </div>

        {/* CHAT AREA */}
        <div className="d-flex flex-column">

          {!selectedChat ? (
            <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
              <FiMessageCircle size={48} />

              <p className="mt-3">
                Select a conversation to start chatting.
              </p>
            </div>
          ) : (
            <>
              {/* CHAT HEADER */}
              <div className="p-3 border-bottom d-flex align-items-center gap-3">

                <Button
                  variant="light"
                  className="d-md-none"
                  onClick={() => {
                    setSelectedId(null);
                    setSelectedChat(null);
                  }}
                >
                  <FiArrowLeft />
                </Button>

                {getImageUrl(
                  selectedChat.itemId?.image
                ) && (
                  <img
                    src={getImageUrl(
                      selectedChat.itemId.image
                    )}
                    alt=""
                    style={{
                      width: 44,
                      height: 44,
                      objectFit: 'cover',
                      borderRadius: 8,
                    }}
                  />
                )}

                <div>
                  <div className="fw-semibold">
                    {otherParticipant(
                      selectedChat
                    )?.name || 'User'}
                  </div>

                  <div className="small text-muted">
                    {selectedChat.itemId?.title ||
                      'Item conversation'}{' '}

                    {selectedChat.itemId?.status && (
                      <Badge bg="secondary">
                        {selectedChat.itemId.status}
                      </Badge>
                    )}
                  </div>
                </div>

              </div>

              {/* MESSAGES */}
              <div
                className="flex-grow-1 p-3"
                style={{
                  overflowY: 'auto',
                  maxHeight: 470,
                }}
              >

                {selectedChat.messages?.length === 0 ? (
                  <div className="text-center text-muted mt-5">
                    Start the conversation.
                  </div>
                ) : (
                  selectedChat.messages.map(
                    (message) => {
                      const mine =
                        message.sender?._id ===
                        user?._id;

                      return (
                        <div
                          key={message._id}
                          className={`d-flex mb-2 ${
                            mine
                              ? 'justify-content-end'
                              : 'justify-content-start'
                          }`}
                        >
                          <div
                            className={`px-3 py-2 rounded-4 ${
                              mine
                                ? 'bg-primary text-white'
                                : 'bg-light'
                            }`}
                            style={{
                              maxWidth: '75%',
                            }}
                          >
                            <div>
                              {message.text}
                            </div>

                            <div
                              className={`small mt-1 ${
                                mine
                                  ? 'text-white-50'
                                  : 'text-muted'
                              }`}
                            >
                              {new Date(
                                message.createdAt
                              ).toLocaleTimeString(
                                [],
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )
                )}

                <div ref={bottomRef} />

              </div>

              {/* MESSAGE INPUT */}
              <Form
                onSubmit={sendMessage}
                className="p-3 border-top"
              >
                <InputGroup>

                  <Form.Control
                    value={text}
                    onChange={(e) =>
                      setText(e.target.value)
                    }
                    placeholder="Type a message..."
                    maxLength={2000}
                  />

                  <Button
                    type="submit"
                    className="btn-cc-primary"
                    disabled={
                      sending ||
                      !text.trim()
                    }
                  >
                    <FiSend />
                  </Button>

                </InputGroup>
              </Form>

            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Chat;