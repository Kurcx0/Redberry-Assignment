import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="mx-[60px] flex items-center justify-between border-t border-line py-8">
      <Logo className="text-lg" />
      <p className="text-sm text-muted">© {new Date().getFullYear()} Kino XII. All rights reserved.</p>
    </footer>
  )
}
