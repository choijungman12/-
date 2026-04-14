import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Owner, CommitteeMember, Meeting, Document, Notice, QnA, Schedule, User } from '../types'
import {
  mockOwners, mockCommitteeMembers, mockMeetings,
  mockDocuments, mockNotices, mockQnA, mockSchedules, projectInfo
} from '../data/mockData'
import type { ProjectInfo } from '../types'

interface AppState {
  // Auth
  currentUser: User | null
  login: (user: User) => void
  logout: () => void

  // Project
  project: ProjectInfo
  updateProject: (data: Partial<ProjectInfo>) => void

  // Owners
  owners: Owner[]
  addOwner: (owner: Owner) => void
  updateOwner: (id: string, data: Partial<Owner>) => void
  deleteOwner: (id: string) => void
  updateConsentStatus: (id: string, status: Owner['consentStatus'], date?: string) => void

  // Committee
  committeeMembers: CommitteeMember[]
  addCommitteeMember: (member: CommitteeMember) => void
  updateCommitteeMember: (id: string, data: Partial<CommitteeMember>) => void
  removeCommitteeMember: (id: string) => void

  // Meetings
  meetings: Meeting[]
  addMeeting: (meeting: Meeting) => void
  updateMeeting: (id: string, data: Partial<Meeting>) => void

  // Documents
  documents: Document[]
  addDocument: (doc: Document) => void
  deleteDocument: (id: string) => void

  // Notices
  notices: Notice[]
  addNotice: (notice: Notice) => void
  updateNotice: (id: string, data: Partial<Notice>) => void
  deleteNotice: (id: string) => void
  incrementViews: (id: string) => void

  // Q&A
  qnaList: QnA[]
  addQnA: (qna: QnA) => void
  answerQnA: (id: string, answer: string, answeredBy: string) => void

  // Schedules
  schedules: Schedule[]
  addSchedule: (schedule: Schedule) => void
  updateSchedule: (id: string, data: Partial<Schedule>) => void
  deleteSchedule: (id: string) => void

  // UI
  sidebarOpen: boolean
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      currentUser: {
        id: 'admin',
        name: '관리자',
        email: 'admin@guki.org',
        role: 'admin',
      },
      login: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),

      // Project
      project: projectInfo,
      updateProject: (data) =>
        set((state) => ({ project: { ...state.project, ...data } })),

      // Owners
      owners: mockOwners,
      addOwner: (owner) =>
        set((state) => ({ owners: [...state.owners, owner] })),
      updateOwner: (id, data) =>
        set((state) => ({
          owners: state.owners.map((o) =>
            o.id === id ? { ...o, ...data, updatedAt: new Date().toISOString() } : o
          ),
        })),
      deleteOwner: (id) =>
        set((state) => ({ owners: state.owners.filter((o) => o.id !== id) })),
      updateConsentStatus: (id, status, date) =>
        set((state) => ({
          owners: state.owners.map((o) =>
            o.id === id
              ? { ...o, consentStatus: status, consentDate: date, updatedAt: new Date().toISOString() }
              : o
          ),
        })),

      // Committee
      committeeMembers: mockCommitteeMembers,
      addCommitteeMember: (member) =>
        set((state) => ({ committeeMembers: [...state.committeeMembers, member] })),
      updateCommitteeMember: (id, data) =>
        set((state) => ({
          committeeMembers: state.committeeMembers.map((m) =>
            m.id === id ? { ...m, ...data } : m
          ),
        })),
      removeCommitteeMember: (id) =>
        set((state) => ({
          committeeMembers: state.committeeMembers.map((m) =>
            m.id === id ? { ...m, isActive: false } : m
          ),
        })),

      // Meetings
      meetings: mockMeetings,
      addMeeting: (meeting) =>
        set((state) => ({ meetings: [...state.meetings, meeting] })),
      updateMeeting: (id, data) =>
        set((state) => ({
          meetings: state.meetings.map((m) =>
            m.id === id ? { ...m, ...data } : m
          ),
        })),

      // Documents
      documents: mockDocuments,
      addDocument: (doc) =>
        set((state) => ({ documents: [...state.documents, doc] })),
      deleteDocument: (id) =>
        set((state) => ({ documents: state.documents.filter((d) => d.id !== id) })),

      // Notices
      notices: mockNotices,
      addNotice: (notice) =>
        set((state) => ({ notices: [notice, ...state.notices] })),
      updateNotice: (id, data) =>
        set((state) => ({
          notices: state.notices.map((n) => (n.id === id ? { ...n, ...data } : n)),
        })),
      deleteNotice: (id) =>
        set((state) => ({ notices: state.notices.filter((n) => n.id !== id) })),
      incrementViews: (id) =>
        set((state) => ({
          notices: state.notices.map((n) =>
            n.id === id ? { ...n, views: n.views + 1 } : n
          ),
        })),

      // Q&A
      qnaList: mockQnA,
      addQnA: (qna) =>
        set((state) => ({ qnaList: [qna, ...state.qnaList] })),
      answerQnA: (id, answer, answeredBy) =>
        set((state) => ({
          qnaList: state.qnaList.map((q) =>
            q.id === id
              ? { ...q, answer, answeredBy, status: 'answered', answeredAt: new Date().toISOString() }
              : q
          ),
        })),

      // Schedules
      schedules: mockSchedules,
      addSchedule: (schedule) =>
        set((state) => ({ schedules: [...state.schedules, schedule] })),
      updateSchedule: (id, data) =>
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === id ? { ...s, ...data } : s
          ),
        })),
      deleteSchedule: (id) =>
        set((state) => ({ schedules: state.schedules.filter((s) => s.id !== id) })),

      // UI
      sidebarOpen: true,
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: 'redevelopment-app-storage',
      partialize: (state) => ({
        owners: state.owners,
        committeeMembers: state.committeeMembers,
        meetings: state.meetings,
        documents: state.documents,
        notices: state.notices,
        qnaList: state.qnaList,
        schedules: state.schedules,
        project: state.project,
        currentUser: state.currentUser,
      }),
    }
  )
)
