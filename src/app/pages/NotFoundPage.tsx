import { Link } from 'react-router'

import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <p className="text-muted-foreground text-sm font-medium">404</p>
      <h1 className="mt-2 text-xl font-bold">페이지를 찾을 수 없어요</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        주소가 바뀌었거나 없는 페이지예요. 홈에서 다시 시작해 주세요.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">홈으로 가기</Link>
      </Button>
    </section>
  )
}
