import { AnimatePresence, AnimateSharedLayout } from 'framer-motion'
import { GetServerSideProps, NextPage } from 'next'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { MapContainer } from '~/src/components/map/container'
import { NavBar } from '~/src/components/nav-bar'
import { SubmitModal } from '~/src/components/submit/submit-modal'
import { DataClient } from '~/src/services/data-client'
import { StateContext } from '~/src/services/state'
import { Submissions } from '~/types/entities'

type HomeProps = {
  page: string
  path: string[]
  artist: string
}

const Home: NextPage<HomeProps> = ({ page, artist }) => {
  const [start, setStart] = useState(false)
  const client = DataClient.useClient()
  const [data, setData] = useState<Submissions>({})

  const fetchData = useCallback(async () => {
    const submissions = await client.getSubmissions()
    const newData = submissions.reduce(
      (hsh, sub) => ({ ...hsh, [sub.id]: sub }),
      {}
    )
    setData((d: Submissions) => ({ ...d, ...newData }))
  }, [client])

  useEffect(() => {
    fetchData()
    setTimeout(() => setStart(true), 0)
  }, [fetchData])

  const Page = useMemo(() => {
    switch (page) {
      case 'submit':
        return SubmitModal
    }
  }, [page])

  return (
    <StateContext.Provider value={{ start, data }}>
      <NavBar />
      <AnimateSharedLayout type='crossfade'>
        <MapContainer search={page == 'submit'} />
        <AnimatePresence>{Page && <Page artist={artist} />}</AnimatePresence>
      </AnimateSharedLayout>
    </StateContext.Provider>
  )
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async ({
  query
}) => {
  if (query.artist !== 'enzo') return { notFound: true }

  const pathParam = (query.path as string[]) ?? []
  const joined = pathParam.join('/')
  const [page, ...path] = pathParam
  switch (joined) {
    case '':
    case 'about':
    case 'submit':
      return {
        props: { page: page ?? '', path: path ?? [], artist: query.artist }
      }
    default:
      return { notFound: true }
  }
}

export default Home
