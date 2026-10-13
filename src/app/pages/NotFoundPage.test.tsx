import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import NotFoundPage from './NotFoundPage'

test('404 페이지에 홈으로 가는 링크가 있다', () => {
  render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>,
  )
  expect(screen.getByRole('link', { name: '홈으로 가기' })).toHaveAttribute('href', '/')
})
