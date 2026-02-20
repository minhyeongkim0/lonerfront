export interface Mission {
  id: number
  category: string
  title: string
  description: string
  verificationCondition: string
  points: number
  postCount: number
  completed?: boolean
}

export interface Post {
  id: number
  missionId: number
  authorId: string
  content: string
  images: string[]
  likes: number
  commentCount: number
  liked?: boolean
  approved: boolean
  createdAt: string
}

export interface Comment {
  id: number
  postId: number
  authorId: string
  content: string
  createdAt: string
}

export interface User {
  id: string
  username: string
  points: number
  birthDate: string
  gender: string
  bank: string
  accountNumber: string
  completedMissions: number
  createdAt: string
}

export interface RefundRequest {
  id: number
  userId: string
  amount: number
  bank: string
  accountNumber: string
  status: "pending" | "completed"
  createdAt: string
}

export const missions: Mission[] = [
  {
    id: 1,
    category: "동네 마트",
    title: "물건 위치 하나 물어보기",
    description: "가까운 마트에 가서 직원에게 물건 위치를 물어보세요.",
    verificationCondition: "장본 사진을 올려주세요",
    points: 2000,
    postCount: 23,
  },
  {
    id: 2,
    category: "재래시장",
    title: "군것질거리 하나 사먹기",
    description: "재래시장에 가서 군것질거리를 하나 사먹어보세요.",
    verificationCondition: "사먹은 음식 사진을 올려주세요",
    points: 2000,
    postCount: 15,
  },
  {
    id: 3,
    category: "셀프빨래",
    title: "빨래방에서 빨래하기",
    description: "가까운 셀프빨래방에 가서 빨래를 해보세요.",
    verificationCondition: "빨래방 인증 사진을 올려주세요",
    points: 3000,
    postCount: 8,
    completed: true,
  },
  {
    id: 4,
    category: "대중교통",
    title: "버스 타고 한 정거장 가기",
    description: "버스를 타고 한 정거장만 이동해보세요.",
    verificationCondition: "버스 안 사진을 올려주세요",
    points: 3000,
    postCount: 12,
  },
  {
    id: 5,
    category: "카페",
    title: "카페에서 음료 주문하기",
    description: "카페에 가서 직접 음료를 주문해보세요.",
    verificationCondition: "음료 사진을 올려주세요",
    points: 2000,
    postCount: 31,
  },
  {
    id: 6,
    category: "공원",
    title: "공원에서 30분 산책하기",
    description: "가까운 공원에서 30분 동안 산책해보세요.",
    verificationCondition: "공원 사진을 올려주세요",
    points: 2500,
    postCount: 19,
  },
]

export const posts: Post[] = [
  {
    id: 1,
    missionId: 1,
    authorId: "user_01",
    content: "오늘 드디어 마트에 나갔다... 직원분이 친절하게 알려주셨어요. 생각보다 별거 아니었는데 왜 이렇게 떨렸을까요 ㅎㅎ",
    images: [],
    likes: 12,
    commentCount: 3,
    approved: true,
    createdAt: "2025-01-15",
  },
  {
    id: 2,
    missionId: 1,
    authorId: "user_05",
    content: "마트 가서 라면 위치 물어봤어요! 직원분이 웃으면서 알려주셨는데 기분이 좋았습니다.",
    images: [],
    likes: 8,
    commentCount: 1,
    approved: true,
    createdAt: "2025-01-14",
  },
  {
    id: 3,
    missionId: 1,
    authorId: "user_12",
    content: "용기 내서 물어봤는데 생각보다 쉬웠어요. 다음엔 더 자신있게 할 수 있을 것 같아요!",
    images: [],
    likes: 15,
    commentCount: 5,
    approved: false,
    createdAt: "2025-01-13",
  },
]

export const comments: Comment[] = [
  { id: 1, postId: 1, authorId: "user_03", content: "대단해요! 저도 도전해봐야겠어요", createdAt: "2025-01-15" },
  { id: 2, postId: 1, authorId: "user_07", content: "화이팅! 첫 발걸음이 제일 어려운 거예요", createdAt: "2025-01-15" },
  { id: 3, postId: 1, authorId: "user_01", content: "감사합니다 여러분 ㅠㅠ", createdAt: "2025-01-16" },
]

export const users: User[] = [
  { id: "user_01", username: "user_01", points: 8000, birthDate: "1995-03-15", gender: "남성", bank: "국민은행", accountNumber: "123-456-7890", completedMissions: 4, createdAt: "2025-01-01" },
  { id: "user_05", username: "user_05", points: 5000, birthDate: "1998-07-22", gender: "여성", bank: "신한은행", accountNumber: "987-654-3210", completedMissions: 2, createdAt: "2025-01-05" },
  { id: "user_12", username: "user_12", points: 3000, birthDate: "2000-11-08", gender: "선택안함", bank: "하나은행", accountNumber: "456-789-0123", completedMissions: 1, createdAt: "2025-01-10" },
]

export const refundRequests: RefundRequest[] = [
  { id: 1, userId: "user_01", amount: 3000, bank: "국민은행", accountNumber: "123-456-7890", status: "pending", createdAt: "2025-01-10" },
  { id: 2, userId: "user_05", amount: 2000, bank: "신한은행", accountNumber: "987-654-3210", status: "completed", createdAt: "2025-01-08" },
]

export const KOREAN_BANKS = [
  "국민은행", "신한은행", "하나은행", "우리은행",
  "NH농협", "IBK기업은행", "카카오뱅크", "토스뱅크",
  "SC제일은행", "씨티은행", "DGB대구은행", "BNK부산은행",
]
